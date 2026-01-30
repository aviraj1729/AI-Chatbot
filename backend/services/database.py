import os
from typing import Dict, List, Optional
from uuid import UUID

import asyncpg
from dotenv import load_dotenv

load_dotenv()


class DatabaseService:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL")
        if not self.database_url:
            raise ValueError("DATABASE_URL not set")

        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        if not self.pool:
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=1,
                max_size=10,
            )

    async def close(self):
        if self.pool:
            await self.pool.close()

    # ---- Sessions ----

    async def create_session(self, session_name: str = "New Chat") -> Dict:
        query = """
        INSERT INTO chat_sessions (session_name)
        VALUES ($1)
        RETURNING *
        """
        async with self.pool.acquire() as conn:
            return dict(await conn.fetchrow(query, session_name))

    async def get_session(self, session_id: UUID) -> Optional[Dict]:
        query = "SELECT * FROM chat_sessions WHERE id=$1"
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, session_id)
            return dict(row) if row else None

    async def update_session_timestamp(self, session_id: UUID):
        query = """
        UPDATE chat_sessions
        SET updated_at = NOW()
        WHERE id=$1
        """
        async with self.pool.acquire() as conn:
            await conn.execute(query, session_id)

    async def get_all_sessions(self, limit: int = 20) -> List[Dict]:
        query = """
        SELECT * FROM chat_sessions
        ORDER BY updated_at DESC
        LIMIT $1
        """
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, limit)
            return [dict(r) for r in rows]

    async def delete_session(self, session_id: UUID) -> bool:
        query = "DELETE FROM chat_sessions WHERE id=$1"
        async with self.pool.acquire() as conn:
            await conn.execute(query, session_id)
        return True

    # ---- Messages ----

    async def create_message(self, session_id: UUID, role: str, content: str) -> Dict:
        query = """
        INSERT INTO chat_messages (session_id, role, content)
        VALUES ($1,$2,$3)
        RETURNING *
        """
        async with self.pool.acquire() as conn:
            return dict(await conn.fetchrow(query, session_id, role, content))

    async def get_session_messages(
        self, session_id: UUID, limit: int = 50
    ) -> List[Dict]:
        query = """
        SELECT * FROM chat_messages
        WHERE session_id=$1
        ORDER BY created_at ASC
        LIMIT $2
        """
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, session_id, limit)
            return [dict(r) for r in rows]

    async def get_recent_messages(
        self, session_id: UUID, limit: int = 10
    ) -> List[Dict]:
        query = """
        SELECT * FROM chat_messages
        WHERE session_id=$1
        ORDER BY created_at DESC
        LIMIT $2
        """
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, session_id, limit)
            return list(reversed([dict(r) for r in rows]))
