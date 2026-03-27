from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routes.extract import router as extract_router
from app.services.nlp_service import load_model
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading spaCy model...")
    load_model()
    logger.info("spaCy model ready.")
    yield
    logger.info("Shutting down AI service.")


app = FastAPI(
    title="Inbox Intelligence — AI Service",
    version="1.0.0",
    description="NLP microservice for extracting structured events from email text.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(extract_router)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "model": "en_core_web_sm"}
