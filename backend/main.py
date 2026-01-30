from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat
from services.dependencies import db_service

app = FastAPI(
    title="AI Chatbot API",
    description="FastAPI backend for an AI chatbot application",
    version="1.0.0",
)


@app.on_event("startup")
async def startup():
    await db_service.connect()


@app.on_event("shutdown")
async def shutdown():
    await db_service.close()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)


@app.get("/")
async def root():
    return {
        "message": "AI Chatbot API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
