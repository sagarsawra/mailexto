"""
Lightweight text utilities: regex-based time/date normalisation helpers.
"""
import re
from datetime import datetime, date, timedelta
from typing import Optional
import dateparser


# ── Time normalisation ──────────────────────────────────────────────────────

_TIME_RE = re.compile(
    r"\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)\b"
    r"|\b(\d{1,2}):(\d{2})\b",
    re.IGNORECASE,
)


def parse_time(text: str) -> Optional[str]:
    """Return first detected time as HH:MM (24-hr), or None."""
    match = _TIME_RE.search(text)
    if not match:
        return None

    groups = match.groups()
    if groups[0] is not None:
        hour = int(groups[0])
        minute = int(groups[1]) if groups[1] else 0
        meridiem = (groups[2] or "").upper()
        if meridiem == "PM" and hour != 12:
            hour += 12
        elif meridiem == "AM" and hour == 12:
            hour = 0
    else:
        hour = int(groups[3])
        minute = int(groups[4])

    return f"{hour:02d}:{minute:02d}"


# ── Date normalisation ──────────────────────────────────────────────────────

_RELATIVE = {
    "today": 0,
    "tonight": 0,
    "tomorrow": 1,
    "day after tomorrow": 2,
    "yesterday": -1,
}

_WEEKDAY_MAP = {
    "monday": 0, "tuesday": 1, "wednesday": 2,
    "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6,
}


def _next_weekday(target_weekday: int) -> date:
    today = date.today()
    days_ahead = (target_weekday - today.weekday() + 7) % 7
    if days_ahead == 0:
        days_ahead = 7
    return today + timedelta(days=days_ahead)


def parse_date(text: str) -> Optional[str]:
    """Return first detected date as YYYY-MM-DD, or None."""
    lower = text.lower()

    # Relative: today / tomorrow etc.
    for phrase, delta in sorted(_RELATIVE.items(), key=lambda x: -len(x[0])):
        if phrase in lower:
            return (date.today() + timedelta(days=delta)).isoformat()

    # Next weekday
    for day_name, day_idx in _WEEKDAY_MAP.items():
        if re.search(rf"\b{day_name}\b", lower):
            return _next_weekday(day_idx).isoformat()

    # Absolute date via dateparser (handles "March 25", "25/03/2026", etc.)
    parsed = dateparser.parse(
        text,
        settings={
            "PREFER_DATES_FROM": "future",
            "RETURN_AS_TIMEZONE_AWARE": False,
            "RELATIVE_BASE": datetime.now(),
        },
    )
    if parsed:
        return parsed.date().isoformat()

    return None


# ── Title extraction ────────────────────────────────────────────────────────

_EVENT_KEYWORDS = [
    "meeting", "call", "interview", "standup", "sync", "demo", "review",
    "deadline", "due", "submit", "launch", "event", "conference", "webinar",
    "workshop", "presentation", "appointment", "catchup", "catch-up",
    "discussion", "briefing", "training", "session", "reminder",
]

_SUBJECT_STRIP_RE = re.compile(
    r"^(re:|fwd:|fw:|\[.*?\]|urgent:|important:)\s*",
    re.IGNORECASE,
)


def clean_subject(subject: str) -> str:
    while True:
        cleaned = _SUBJECT_STRIP_RE.sub("", subject).strip()
        if cleaned == subject:
            break
        subject = cleaned
    return subject


def has_event_keyword(text: str) -> bool:
    lower = text.lower()
    return any(kw in lower for kw in _EVENT_KEYWORDS)


def extract_title_from_text(text: str, spacy_doc=None) -> Optional[str]:
    """
    Strategy:
      1. Use first sentence (spaCy) if it's short enough.
      2. Find first line containing an event keyword.
      3. Fallback: first 60 chars of text.
    """
    if spacy_doc is not None:
        for sent in spacy_doc.sents:
            sent_text = sent.text.strip()
            if has_event_keyword(sent_text) and len(sent_text) <= 80:
                return clean_subject(sent_text)

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for line in lines:
        if has_event_keyword(line) and len(line) <= 80:
            return clean_subject(line)

    if lines:
        return clean_subject(lines[0])[:60]

    return None


# ── Confidence scoring ──────────────────────────────────────────────────────

def compute_confidence(title, date_val, time_val, location) -> float:
    """Heuristic confidence: more fields extracted → higher score."""
    score = 0.0
    if title:
        score += 0.25
    if date_val:
        score += 0.30
    if time_val:
        score += 0.25
    if location:
        score += 0.20
    return round(score, 2)
