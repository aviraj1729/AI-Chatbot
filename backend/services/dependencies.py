from services.database import DatabaseService

# single shared instance
db_service = DatabaseService()


def get_db() -> DatabaseService:
    return db_service
