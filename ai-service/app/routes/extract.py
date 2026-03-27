from fastapi import APIRouter, HTTPException, status
from app.schemas.event_schema import ExtractRequest, ExtractResponse
from app.services.nlp_service import extract_event
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Extraction"])


@router.post(
    "/extract",
    response_model=ExtractResponse,
    status_code=status.HTTP_200_OK,
    summary="Extract structured event data from email text",
)
def extract(payload: ExtractRequest) -> ExtractResponse:
    """
    Accepts raw email text and returns extracted event fields:
    title, date (YYYY-MM-DD), time (HH:MM), location, confidence score.
    """
    try:
        result = extract_event(payload.text)
        return ExtractResponse(**result)
    except Exception as exc:
        logger.exception("Extraction failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Event extraction failed. Please try again.",
        )
