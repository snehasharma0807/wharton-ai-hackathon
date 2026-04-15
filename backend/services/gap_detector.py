"""
gap_detector.py
---------------
Computes per-property information-gap scores across 8 amenity categories.

Gap score formula
  field_sparsity  = null/empty relevant desc fields  / total relevant fields  (weight 0.4)
  review_entropy  = from nlp_analyzer                                          (weight 0.6)
  gap_score       = 0.4 * field_sparsity + 0.6 * review_entropy
"""

import pandas as pd
from services.nlp_analyzer import compute_entropy_scores

# ---------------------------------------------------------------------------
# Category definitions
# ---------------------------------------------------------------------------
GAP_CATEGORIES: dict[str, dict] = {
    "pet_policy": {
        "fields":    ["pet_policy"],
        "keywords":  ["pet", "dog", "cat", "animal"],
        "icon":      "🐾",
        "question":  "Does this property allow pets?",
        "answerOptions": [
            {"value": "yes_all",    "label": "Yes, all pets welcome"},
            {"value": "yes_small",  "label": "Yes, small pets only"},
            {"value": "no",         "label": "No pets allowed"},
            {"value": "unknown",    "label": "I'm not sure"},
        ],
    },
    "accessibility": {
        "fields":    ["property_amenity_accessibility"],
        "keywords":  ["wheelchair", "accessible", "elevator", "ramp", "disabled"],
        "icon":      "♿",
        "question":  "How accessible is this property for guests with mobility needs?",
        "answerOptions": [
            {"value": "fully",      "label": "Fully accessible"},
            {"value": "partial",    "label": "Partially accessible"},
            {"value": "not",        "label": "Not accessible"},
            {"value": "unknown",    "label": "I didn't notice"},
        ],
    },
    "parking": {
        "fields":    ["property_amenity_parking"],
        "keywords":  ["parking", "valet", "garage", "car"],
        "icon":      "🅿️",
        "question":  "What is the parking situation at this property?",
        "answerOptions": [
            {"value": "free",       "label": "Free parking available"},
            {"value": "paid",       "label": "Paid parking on site"},
            {"value": "valet",      "label": "Valet parking"},
            {"value": "none",       "label": "No parking"},
        ],
    },
    "spa": {
        "fields":    ["property_amenity_spa"],
        "keywords":  ["spa", "massage", "sauna", "wellness", "pool"],
        "icon":      "💆",
        "question":  "Did you use any spa or wellness facilities?",
        "answerOptions": [
            {"value": "yes_great",  "label": "Yes, they were excellent"},
            {"value": "yes_ok",     "label": "Yes, they were okay"},
            {"value": "no_used",    "label": "No, I didn't use them"},
            {"value": "no_exist",   "label": "There were no spa facilities"},
        ],
    },
    "family": {
        "fields":    ["property_amenity_family_friendly", "children_and_extra_bed_policy"],
        "keywords":  ["kids", "children", "family", "crib", "baby"],
        "icon":      "👨‍👩‍👧",
        "question":  "How family-friendly is this property?",
        "answerOptions": [
            {"value": "very",       "label": "Very family-friendly"},
            {"value": "somewhat",   "label": "Somewhat family-friendly"},
            {"value": "not",        "label": "Not family-friendly"},
            {"value": "no_kids",    "label": "I didn't travel with kids"},
        ],
    },
    "food_drink": {
        "fields":    ["property_amenity_food_and_drink"],
        "keywords":  ["restaurant", "bar", "breakfast", "dinner", "room service"],
        "icon":      "🍽️",
        "question":  "How would you rate the food and drink options?",
        "answerOptions": [
            {"value": "excellent",  "label": "Excellent — highly recommend"},
            {"value": "good",       "label": "Good"},
            {"value": "average",    "label": "Average"},
            {"value": "poor",       "label": "Poor"},
        ],
    },
    "business": {
        "fields":    ["property_amenity_business_services"],
        "keywords":  ["conference", "meeting", "business center", "wifi"],
        "icon":      "💼",
        "question":  "How suitable is this property for business travelers?",
        "answerOptions": [
            {"value": "great",      "label": "Great for business"},
            {"value": "adequate",   "label": "Adequate"},
            {"value": "poor",       "label": "Poor for business"},
            {"value": "leisure",    "label": "I was here for leisure"},
        ],
    },
    "outdoor": {
        "fields":    ["property_amenity_outdoor"],
        "keywords":  ["pool", "garden", "terrace", "balcony", "beach"],
        "icon":      "🌿",
        "question":  "How are the outdoor spaces and facilities?",
        "answerOptions": [
            {"value": "excellent",  "label": "Excellent outdoor spaces"},
            {"value": "good",       "label": "Good"},
            {"value": "limited",    "label": "Limited outdoor areas"},
            {"value": "none",       "label": "No notable outdoor spaces"},
        ],
    },
}

URGENCY_THRESHOLD = 0.65


def _field_sparsity(property_row: pd.Series, fields: list[str]) -> float:
    """Fraction of expected description fields that are null/empty."""
    if not fields:
        return 1.0
    missing = sum(
        1 for f in fields
        if f not in property_row.index or pd.isna(property_row.get(f)) or str(property_row.get(f, "")).strip() == ""
    )
    return missing / len(fields)


def detect_gaps(
    property_id: str | int,
    descriptions_df: pd.DataFrame,
    reviews_df: pd.DataFrame,
    top_n: int = 4,
    entropy_scores_override: dict[str, float] | None = None,
) -> list[dict]:
    """
    Returns up to *top_n* gap categories for the given property, sorted by
    gap_score descending.

    Each item:
      {id, topic, icon, urgency, question, answerOptions, score}

    Pass *entropy_scores_override* to supply pre-computed (e.g. OpenAI-derived)
    entropy scores and skip the synchronous keyword-matching path.
    """
    pid = str(property_id)

    # Locate the property row in descriptions
    id_col = next((c for c in descriptions_df.columns if "property_id" in c.lower() or c.lower() in ("id", "eg_property_id")), None)
    desc_matches = descriptions_df[descriptions_df[id_col].astype(str) == pid] if id_col else descriptions_df.iloc[0:0]
    if desc_matches.empty:
        property_row = pd.Series(dtype=object)
    else:
        property_row = desc_matches.iloc[0]

    # Use caller-supplied scores or fall back to synchronous keyword matching
    entropy_scores = entropy_scores_override or compute_entropy_scores(property_id, reviews_df)

    results = []
    for category, meta in GAP_CATEGORIES.items():
        sparsity = _field_sparsity(property_row, meta["fields"])
        entropy  = entropy_scores.get(category, 1.0 / len(GAP_CATEGORIES))
        score    = round(0.4 * sparsity + 0.6 * entropy, 4)

        results.append({
            "id":            category,
            "topic":         category.replace("_", " ").title(),
            "icon":          meta["icon"],
            "urgency":       "High" if score > URGENCY_THRESHOLD else "Moderate",
            "question":      meta["question"],
            "answerOptions": meta["answerOptions"],
            "score":         score,
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_n]
