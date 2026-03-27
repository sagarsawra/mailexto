# AI Inbox Intelligence — NLP Microservice

FastAPI service that extracts structured event data from raw email text.

## Setup

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload --port 8001
```

## Endpoint

**POST** `/extract`

```json
// Request
{ "text": "Team meeting tomorrow at 5 PM in Mumbai" }

// Response
{
  "title": "Team meeting",
  "date": "2026-03-21",
  "time": "17:00",
  "location": "Mumbai",
  "confidence": 0.92
}
```

## Health Check

**GET** `/health` → `{ "status": "ok", "model": "en_core_web_sm" }`
