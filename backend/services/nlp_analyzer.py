"""
nlp_analyzer.py
---------------
Computes per-category entropy scores from property reviews.

Primary path:  async OpenAI GPT-4o-mini topic-frequency extraction.
Fallback path: keyword-matching (used when OPENAI_API_KEY is absent or the
               OpenAI call / JSON parse fails).

Results are cached in-process for 1 hour, keyed by property_id.
"""

import json
import logging
import math
import os
import time
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Keyword fallback map (also defines the canonical category set)
# ---------------------------------------------------------------------------

GAP_KEYWORDS: dict[str, list[str]] = {
    "pet_policy":    ["pet", "dog", "cat", "animal"],
    "accessibility": ["wheelchair", "accessible", "elevator", "ramp", "disabled"],
    "parking":       ["parking", "valet", "garage", "car"],
    "spa":           ["spa", "massage", "sauna", "wellness", "pool"],
    "family":        ["kids", "children", "family", "crib", "baby"],
    "food_drink":    ["restaurant", "bar", "breakfast", "dinner", "room service"],
    "business":      ["conference", "meeting", "business center", "wifi"],
    "outdoor":       ["pool", "garden", "terrace", "balcony", "beach"],
}

# ---------------------------------------------------------------------------
# In-process cache  {property_id: {"scores": {...}, "ts": float}}
# ---------------------------------------------------------------------------

_CACHE_TTL_SECONDS = 3600  # 1 hour
_cache: dict[str, dict[str, Any]] = {}


def _cache_get(property_id: str) -> dict[str, float] | None:
    entry = _cache.get(str(property_id))
    if entry and (time.time() - entry["ts"]) < _CACHE_TTL_SECONDS:
        return entry["scores"]
    return None


def _cache_set(property_id: str, scores: dict[str, float]) -> None:
    _cache[str(property_id)] = {"scores": scores, "ts": time.time()}


def cache_invalidate(property_id: str) -> None:
    """Remove a property's cached scores so the next request recomputes."""
    _cache.pop(str(property_id), None)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_review_texts(property_id: str | int, reviews_df: pd.DataFrame) -> list[str]:
    """Return up to 50 raw review strings for the property."""
    pid = str(property_id)
    id_col = next(
        (c for c in reviews_df.columns
         if "property_id" in c.lower() or c.lower() in ("id", "eg_property_id")),
        None,
    )
    if id_col is None:
        return []

    prop_reviews = reviews_df[reviews_df[id_col].astype(str) == pid].tail(50)
    if prop_reviews.empty:
        return []

    text_cols = [
        c for c in prop_reviews.columns
        if any(kw in c.lower() for kw in ("review", "comment", "text"))
    ] or prop_reviews.select_dtypes(include="object").columns.tolist()

    if not text_cols:
        return []

    return (
        prop_reviews[text_cols]
        .fillna("")
        .astype(str)
        .apply(lambda row: " ".join(row), axis=1)
        .tolist()
    )


def _keyword_frequencies(texts: list[str]) -> dict[str, float]:
    """Return mention frequency per category using keyword matching."""
    if not texts:
        return {cat: 0.0 for cat in GAP_KEYWORDS}
    lowered = [t.lower() for t in texts]
    return {
        cat: min(
            sum(1 for t in lowered if any(kw in t for kw in kws)) / len(lowered),
            1.0,
        )
        for cat, kws in GAP_KEYWORDS.items()
    }


def _frequencies_to_entropy_scores(freqs: dict[str, float]) -> dict[str, float]:
    """
    entropy_i = -freq_i * log2(freq_i + ε)   (higher when rarely mentioned)
    Returns normalised dict that sums to 1.
    """
    raw = {
        cat: -freq * math.log2(freq + 1e-9)
        for cat, freq in freqs.items()
    }
    total = sum(raw.values())
    if total == 0:
        uniform = 1.0 / len(raw)
        return {cat: uniform for cat in raw}
    return {cat: v / total for cat, v in raw.items()}


def _uniform() -> dict[str, float]:
    uniform = 1.0 / len(GAP_KEYWORDS)
    return {cat: uniform for cat in GAP_KEYWORDS}


# ---------------------------------------------------------------------------
# OpenAI path
# ---------------------------------------------------------------------------

async def _openai_frequencies(review_text: str) -> dict[str, float] | None:
    """
    Ask GPT-4o-mini for per-category mention frequencies.
    Returns None on any error so the caller can fall back to keyword matching.
    """
    try:
        from openai import AsyncOpenAI  # local import — only needed on this path
    except ImportError:
        logger.warning("openai package not installed; falling back to keyword matching")
        return None

    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set; falling back to keyword matching")
        return None

    category_list = ", ".join(GAP_KEYWORDS.keys())
    user_prompt = (
        f"Here are hotel reviews:\n{review_text}\n\n"
        f"For each category below, estimate what fraction of these reviews "
        f"substantively mention it (0.0 = never mentioned, 1.0 = mentioned in "
        f"every review). Categories: {category_list}\n\n"
        f"Return JSON: {{category: frequency_float}}"
    )

    client = AsyncOpenAI(api_key=api_key)
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert at analyzing hotel reviews. Given a set of "
                        "reviews, identify what proportion of reviews meaningfully mention "
                        "each topic category. Return ONLY a JSON object with no markdown."
                    ),
                },
                {"role": "user", "content": user_prompt},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
    except Exception as exc:
        logger.warning("OpenAI call failed (%s); falling back to keyword matching", exc)
        return None

    raw_content = response.choices[0].message.content or ""
    try:
        parsed: dict[str, Any] = json.loads(raw_content)
    except json.JSONDecodeError:
        logger.warning("OpenAI returned malformed JSON; falling back to keyword matching")
        return None

    # Validate: must have all expected categories and numeric values in [0, 1]
    freqs: dict[str, float] = {}
    for cat in GAP_KEYWORDS:
        val = parsed.get(cat)
        if val is None:
            logger.warning("OpenAI response missing category '%s'; falling back", cat)
            return None
        try:
            freqs[cat] = max(0.0, min(1.0, float(val)))
        except (TypeError, ValueError):
            logger.warning("OpenAI returned non-numeric value for '%s'; falling back", cat)
            return None

    return freqs


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def analyze_reviews_with_openai(
    property_id: str | int,
    reviews_df: pd.DataFrame,
    gap_categories: dict,   # passed in but we use GAP_KEYWORDS directly
) -> dict[str, float]:
    """
    Async entry point.  Returns normalised entropy scores {category: float}
    that sum to 1.  Uses OpenAI when available; keyword matching otherwise.
    Results are cached for 1 hour.
    """
    pid = str(property_id)

    cached = _cache_get(pid)
    if cached is not None:
        return cached

    texts = _extract_review_texts(pid, reviews_df)

    if not texts:
        scores = _uniform()
        _cache_set(pid, scores)
        return scores

    # Truncate each review to 300 chars, join for the prompt
    review_text = "\n".join(t[:300] for t in texts)

    freqs = await _openai_frequencies(review_text)

    if freqs is None:
        # Fall back to keyword matching
        freqs = _keyword_frequencies(texts)

    scores = _frequencies_to_entropy_scores(freqs)
    _cache_set(pid, scores)
    return scores


def compute_entropy_scores(
    property_id: str | int,
    reviews_df: pd.DataFrame,
) -> dict[str, float]:
    """
    Synchronous fallback kept for backward compatibility with gap_detector.py.
    Uses keyword matching only (no OpenAI call).
    """
    pid = str(property_id)

    cached = _cache_get(pid)
    if cached is not None:
        return cached

    texts = _extract_review_texts(pid, reviews_df)
    if not texts:
        return _uniform()

    freqs = _keyword_frequencies(texts)
    scores = _frequencies_to_entropy_scores(freqs)
    _cache_set(pid, scores)
    return scores
