"""
Core NLP service.
Uses optional spaCy for NER (if available) and text_utils for date/time parsing.
"""
import logging
from typing import Optional

# ❌ removed: import spacy

from app.utils.text_utils import (
    parse_date,
    parse_time,
    extract_title_from_text,
    has_event_keyword,
    compute_confidence,
)

logger = logging.getLogger(__name__)

_nlp = None


def load_model() -> None:
    global _nlp
    if _nlp is None:
        try:
            import spacy  # ✅ lazy import (safe)

            _nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy en_core_web_sm loaded successfully.")
        except Exception:
            logger.warning(
                "spaCy not available. Running without NER (location extraction disabled)."
            )
            _nlp = None


def get_model():
    global _nlp
    if _nlp is None:
        load_model()
    return _nlp


def _extract_location(doc) -> Optional[str]:
    """
    Pull first GPE (geo-political entity) or LOC from spaCy NER.
    Falls back to None if model unavailable.
    """
    if doc is None:
        return None
    for ent in doc.ents:
        if ent.label_ in ("GPE", "LOC", "FAC"):
            return ent.text.strip()
    return None


def extract_event(text: str) -> dict:
    """
    Main extraction pipeline.
    Returns a dict matching ExtractResponse schema.
    """
    nlp = get_model()
    doc = nlp(text) if nlp else None

    is_event = has_event_keyword(text)

    title = extract_title_from_text(text, spacy_doc=doc)
    date_val = parse_date(text)
    time_val = parse_time(text)
    location = _extract_location(doc)

    confidence = compute_confidence(title, date_val, time_val, location)

    # Downgrade confidence if no event keyword detected
    if not is_event:
        confidence = round(confidence * 0.5, 2)

    return {
        "title": title,
        "date": date_val,
        "time": time_val,
        "location": location,
        "confidence": confidence,
        "is_event": is_event,
    }