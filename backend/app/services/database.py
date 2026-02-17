from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os

class Database:
    client: Optional[AsyncIOMotorClient] = None

database = Database()

async def connect_to_mongo():
    """Create database connection"""
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database.client = AsyncIOMotorClient(mongo_url)
    # احذف السطر المسبب للمشكلة
    print(f"Connected to MongoDB: {mongo_url}")

async def close_mongo_connection():
    """Close database connection"""
    if database.client:
        database.client.close()
        print("Disconnected from MongoDB")

def get_database():
    """Get database instance with safety check"""
    if database.client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="قاعدة البيانات غير متصلة حالياً"
        )
    db_name = os.getenv("MONGODB_DB", "voting_system")
    return database.client[db_name]
