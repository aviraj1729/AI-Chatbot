import traceback
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from schemas.chat import (
    ChatHistoryResponse,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatResponse,
    ChatSessionCreate,
    ChatSessionResponse,
)
from services.ai_service import AIService
from services.database import DatabaseService
from services.dependencies import get_db  # ✅ FIXED

router = APIRouter(prefix="/api/chat", tags=["chat"])

ai_service = AIService()


@router.post("/sessions", response_model=ChatSessionResponse)
async def create_session(
    session: ChatSessionCreate,
    db: DatabaseService = Depends(get_db),
):
    session_data = await db.create_session(session.session_name)
    return ChatSessionResponse(**session_data)


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_sessions(
    db: DatabaseService = Depends(get_db),
):
    sessions = await db.get_all_sessions()
    return [ChatSessionResponse(**s) for s in sessions]


@router.get("/sessions/{session_id}", response_model=ChatHistoryResponse)
async def get_session_history(
    session_id: UUID,
    db: DatabaseService = Depends(get_db),
):
    session = await db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await db.get_session_messages(session_id)

    return ChatHistoryResponse(
        session=ChatSessionResponse(**session),
        messages=[ChatMessageResponse(**m) for m in messages],
    )


@router.post("/message", response_model=ChatResponse)
async def send_message(
    message: ChatMessageCreate,
    db: DatabaseService = Depends(get_db),
):
    session_id = message.session_id

    if not session_id:
        session = await db.create_session()
        session_id = session["id"]
    else:
        if not await db.get_session(session_id):
            raise HTTPException(status_code=404, detail="Session not found")

    user_msg = await db.create_message(
        session_id=session_id,
        role="user",
        content=message.content,
    )

    history = await db.get_recent_messages(session_id)
    conversation = [{"role": m["role"], "content": m["content"]} for m in history]

    ai_reply = await ai_service.generate_response_async(
        message.content,
        conversation,
    )

    print("AI Reply", ai_reply)

    assistant_msg = await db.create_message(
        session_id=session_id,
        role="assistant",
        content=ai_reply,
    )

    await db.update_session_timestamp(session_id)

    return ChatResponse(
        session_id=session_id,
        user_message=ChatMessageResponse(**user_msg),
        assistant_message=ChatMessageResponse(**assistant_msg),
    )


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: UUID,
    db: DatabaseService = Depends(get_db),
):
    await db.delete_session(session_id)
    return {"message": "Session deleted successfully"}
