"""
Seed script to populate database with initial data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timezone
import bcrypt
import os
import hashlib

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "voting_system")

async def seed_database():
    """Seed database with admin user and sample candidates"""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[MONGODB_DB]
    
    print("🌱 Starting database seed...")
    
    # Create admin user
    admin_password = "admin123"
    admin_hash = hashlib.sha256(admin_password.encode()).hexdigest()
    
    admin_user = {
        "username": "admin",
        "password": admin_hash,
        "created_at": datetime.now(timezone.utc)
    }
    
    # Check if admin exists
    existing_admin = await db.admin.find_one({"username": "admin"})
    if not existing_admin:
        await db.admin.insert_one(admin_user)
        print("✅ Admin user created: username='admin', password='admin123'")
    else:
        print("ℹ️  Admin user already exists")
    
    # # Create sample candidates
    # candidates = [
    #     {
    #         "name_ar": "أحمد محمد",
    #         "name_en": "Ahmed Mohammed",
    #         "photo_url": None,
    #         "category": "chairman",
    #         "created_at": datetime.utcnow()
    #     },
    #     {
    #         "name_ar": "فاطمة علي",
    #         "name_en": "Fatima Ali",
    #         "photo_url": None,
    #         "category": "chairman",
    #         "created_at": datetime.utcnow()
    #     },
    #     {
    #         "name_ar": "عبدالله حسن",
    #         "name_en": "Abdullah Hassan",
    #         "photo_url": None,
    #         "category": "chairman",
    #         "created_at": datetime.utcnow()
    #     },
    #     {
    #         "name_ar": "سارة خالد",
    #         "name_en": "Sara Khalid",
    #         "photo_url": None,
    #         "category": "representative",
    #         "created_at": datetime.utcnow()
    #     },
    #     {
    #         "name_ar": "محمد عمر",
    #         "name_en": "Mohammed Omar",
    #         "photo_url": None,
    #         "category": "representative",
    #         "created_at": datetime.utcnow()
    #     },
    #     {
    #         "name_ar": "علي محمد",
    #         "name_en": "Ali Mohammed",
    #         "photo_url": None,
    #         "category": "secretary",
    #         "created_at": datetime.utcnow()
    #     },
    #     {
    #         "name_ar": "عبدالله بن محمد",
    #         "name_en": "Abdullah bin Mohammed",
    #         "photo_url": None,
    #         "category": "secretary",
    #         "created_at": datetime.utcnow()
    #     },
    #     {
    #         "name_ar": "حسين علي",
    #         "name_en": "Hussein Ali",
    #         "photo_url": None,
    #         "category": "treasurer",
    #         "created_at": datetime.utcnow()
    #     },
    #     {
    #         "name_ar": "يوسف بن إبراهيم",
    #         "name_en": "Yousef bin Ibrahim",
    #         "photo_url": None,
    #         "category": "treasurer",
    #         "created_at": datetime.utcnow()
    #     },
    #     {
    #         "name_ar": "أحمد محمد",
    #         "name_en": "Ahmed Mohammed",
    #         "photo_url": None,
    #         "category": "vice_president",
    #         "created_at": datetime.now(timezone.utc)
    #     },
    # ]
    
    # # Insert candidates
    # inserted_count = 0
    # for candidate in candidates:
    #     existing = await db.candidates.find_one({
    #         "name_ar": candidate["name_ar"],
    #         "category": candidate["category"]
    #     })
    #     if not existing:
    #         await db.candidates.insert_one(candidate)
    #         inserted_count += 1
    
    # print(f"✅ Inserted {inserted_count} new candidates")
    # print(f"ℹ️  Total candidates in database: {await db.candidates.count_documents({})}")
    
    client.close()
    print("🎉 Database seed completed!")

if __name__ == "__main__":
    asyncio.run(seed_database())
