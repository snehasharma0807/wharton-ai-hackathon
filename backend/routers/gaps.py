from fastapi import APIRouter, HTTPException, Request

from services.gap_detector import GAP_CATEGORIES, detect_gaps
from services.nlp_analyzer import analyze_reviews_with_openai, cache_invalidate

router = APIRouter(prefix="/gaps", tags=["gaps"])


def _get_property_ids(descriptions_df) -> list[str]:
    id_col = next(
        (c for c in descriptions_df.columns
         if "property_id" in c.lower() or c.lower() in ("id", "eg_property_id")),
        None,
    )
    return descriptions_df[id_col].astype(str).tolist() if id_col else []


# ---------------------------------------------------------------------------
# GET /gaps/{property_id}
# ---------------------------------------------------------------------------

@router.get("/{property_id}")
async def get_gaps(property_id: str, request: Request):
    """
    Return up to 4 highest-information-gain gap categories for a property.
    Uses OpenAI for entropy scoring when OPENAI_API_KEY is set.
    """
    descriptions_df = request.app.state.descriptions_df
    reviews_df      = request.app.state.reviews_df

    if property_id not in _get_property_ids(descriptions_df):
        raise HTTPException(status_code=404, detail=f"Property '{property_id}' not found")

    # Async OpenAI-backed entropy scores (falls back to keyword matching internally)
    entropy_scores = await analyze_reviews_with_openai(
        property_id, reviews_df, GAP_CATEGORIES
    )

    gaps = detect_gaps(
        property_id, descriptions_df, reviews_df,
        entropy_scores_override=entropy_scores,
    )
    return gaps


# ---------------------------------------------------------------------------
# POST /gaps/refresh/{property_id}
# ---------------------------------------------------------------------------

@router.post("/refresh/{property_id}")
async def refresh_gaps(property_id: str, request: Request):
    """
    Invalidate the in-memory entropy cache for this property and recompute.
    Call this after new answers are submitted so the next GET /gaps returns
    fresh scores.
    """
    descriptions_df = request.app.state.descriptions_df
    reviews_df      = request.app.state.reviews_df

    if property_id not in _get_property_ids(descriptions_df):
        raise HTTPException(status_code=404, detail=f"Property '{property_id}' not found")

    cache_invalidate(property_id)

    entropy_scores = await analyze_reviews_with_openai(
        property_id, reviews_df, GAP_CATEGORIES
    )
    gaps = detect_gaps(
        property_id, descriptions_df, reviews_df,
        entropy_scores_override=entropy_scores,
    )
    return {"refreshed": True, "gaps": gaps}
