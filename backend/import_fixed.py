import pandas as pd
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import hashlib
from datetime import datetime
import os




def calculate_age_from_cpr(cpr: str):
    try:
        cpr = str(cpr).strip().split('.')[0]
        cpr = cpr.zfill(9)
        if not cpr.isdigit() or len(cpr) != 9:
                return None

        yy = int(cpr[0:2])
        mm = int(cpr[2:4])
        dd = int(cpr[4:6])

        # --- FIX FOR 00 VALUES ---
        # If month is 00, default to January (01)
        if mm == 0: mm = 1
        # If day is 00, default to the 1st of the month (01)
        if dd == 0: dd = 1
        # -------------------------

        # 1. Determine the Century
        current_year_short = datetime.today().year % 100
        if yy > current_year_short:
            year = 1900 + yy
        else:
            year = 2000 + yy
        
        # 2. Validate and Create Date Object
        # Using a nested try to catch "31st of Feb" type errors after fixing 00s
        try:
            birth_date = datetime(year, mm, dd)
        except ValueError:
            # If still invalid (e.g., 31st of June), default to 1st of that month
            birth_date = datetime(year, mm, 1)

        today = datetime.today()

        # 3. Calculate Age
        has_had_birthday = (today.month, today.day) >= (birth_date.month, birth_date.day)
        age = today.year - birth_date.year - (0 if has_had_birthday else 1)
        
        return int(age)
    except Exception:
        return None

def hash_password(password):
    """تشفير الباسورد باستخدام SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

async def import_election_data():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.voting_system
    
    # 1. Clear Old Data + Drop Indexes
    print("🗑️ Clearing ALL data and indexes...")
    collections = ['voters', 'admin', 'voter_mangment', 'votes' , 'settings']
    for coll in collections:
        await db[coll].delete_many({})
        # Drop problematic indexes
        # try:
        #     await db[coll].drop_index("candidate_id_1")
        # except:
        #     pass
        try:
            await db[coll].drop_index("voterIdHash_1")
        except:
            pass
    
    # 2. Create NEW indexes (correct field names)
    print("🏗️ Creating indexes...")
    await db.voters.create_index("VoterId", unique=True)
    await db.admin.create_index("username", unique=True)
    await db.voter_mangment.create_index("username", unique=True)
    await db.votes.create_index({ "voterIdHash": 1 }, unique=True )
    


    
    # 3. Voters (Skip if no file)
    print("\n📥 استيراد الناخبين...")
    imported = 0
    if os.path.exists('Total Voters participated Query2.xlsx'):
        try:
            df = pd.read_excel('Total Voters participated Query2.xlsx')
            for _, row in df.iterrows():
                try:
                    voter_name = str(row['أسم الناخب'])[:100]
                    voter_id_raw = str(row['رقم الناخب']).strip().split('.')[0]
                    voter_id = voter_id_raw.zfill(9) # Fixes the 000 problem
                    raw_membership = str(row.get('نوع العضوية', '')).strip()
                    if raw_membership.lower() in ['nan', '']:
                        membership_type = "عضوية ناقصة"
                    elif "كاملة" in raw_membership:
                        membership_type = "عضوية كاملة"
                    else:
                        membership_type = "عضوية ناقصة"
                    # phone = str(row.get('MobilePhone', ''))
                    calculated_age = calculate_age_from_cpr(voter_id)
                    voters = {
                        "VoterId": voter_id,
                        "VoterName": voter_name,
                        "MembershipType": membership_type,
                        "isEligible": False, 
                        "hasVoted": False,
                        "phone": "00000000000",
                        "address": "",
                        "Age": calculated_age,
                        "created_at": datetime.now()
                    }
                    await db.voters.insert_one(voters)
                    imported += 1
                except Exception as inner_e:
                    print(f"   ⚠️ تخطي ناخب: {inner_e}")
                    continue
            print(f"✅ تم استيراد {imported} ناخب من voters.xlsx")
        except Exception as e:
            print(f"❌ خطأ في الناخبين: {e}")

    # 4. Admin accounts
    print("\n👤 إضافة مدير النظام...")
    admin = {
        "username": "admin",
        "password": hash_password("admin123"),
        "created_at": datetime.now()
    }
    await db.admin.insert_one(admin)
    
    print("👤 إضافة voter management...")
    voter_mangment = {
        "username": "voterMgmt",
        "password": hash_password("admin123"),
        "created_at": datetime.now()
    }
    await db.voter_mangment.insert_one(voter_mangment)



    # 5. System Settings (Global Election State)
    print("\n⚙️ تهيئة إعدادات النظام المركزية...")
    election_settings = {
        "_id": "election_state",
        "is_locked": False, # النظام مفتوح للتعديل عند البداية
        "is_open": False,   # التصويت مغلق عند البداية
        "updated_at": datetime.now()
    }
    # نستخدم update_one مع upsert=True لضمان عدم التكرار
    await db.settings.update_one(
        {"_id": "election_state"},
        {"$set": election_settings},
        upsert=True
    )
    print("✅ تم ضبط إعدادات النظام (الحالة الافتراضية: مفتوح للتعديل / مغلق للتصويت)")
   
    # 6. Final stats
    print("\n" + "="*60)
    print("📊 الإحصائيات النهائية:")
    print("="*60)
    stats = await asyncio.gather(
        db.voters.count_documents({}),
        db.admin.count_documents({}),
        db.voter_mangment.count_documents({})
    )
    print(f"✅ الناخبين: {stats[0]}")
    print(f"✅ المديرين: {stats[1]}")
    print(f"✅ إدارة الناخبين: {stats[2]}")
    
    print("\n🎉 ✅ اكتمل الاستيراد بنجاح!")
    print("="*60)
    print("🔐 بيانات الدخول:")
    print("   👑 Admin: admin / admin123")
    print("\n🚀 Backend: python -m uvicorn app.main:app --reload --port 8080")

if __name__ == "__main__":
    asyncio.run(import_election_data())
