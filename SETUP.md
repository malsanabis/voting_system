# دليل الإعداد الكامل - Complete Setup Guide

## المتطلبات الأساسية

- Node.js 16+ 
- Python 3.11+
- Docker & Docker Compose (اختياري)
- MongoDB (إذا لم تستخدم Docker)

## الإعداد السريع مع Docker

### 1. تشغيل Backend و MongoDB

```bash
docker-compose up -d
```

### 2. تهيئة قاعدة البيانات

```bash
# انتظر 10 ثواني حتى يبدأ MongoDB
sleep 10

# تشغيل seed script
docker exec -it voting_backend python -m app.utils.seed
```

### 3. تثبيت وتشغيل Frontend

```bash
# في مجلد المشروع الرئيسي
npm install
npm run dev
```

### 4. الوصول للتطبيق

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## الإعداد اليدوي (بدون Docker)

### Backend

1. **تثبيت Python dependencies:**

```bash
cd backend
pip install -r requirements.txt
```

2. **إعداد MongoDB:**

- قم بتثبيت MongoDB محلياً أو استخدم MongoDB Atlas
- تأكد من تشغيل MongoDB على `localhost:27017`

3. **إعداد متغيرات البيئة:**

```bash
cd backend
cp .env.example .env
# قم بتعديل .env حسب الحاجة
```

4. **تهيئة قاعدة البيانات:**

```bash
python -m app.utils.seed
```

5. **تشغيل Backend:**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

1. **تثبيت المكتبات:**

```bash
npm install
```

2. **إعداد متغيرات البيئة (اختياري):**

أنشئ ملف `.env` في المجلد الرئيسي:

```env
VITE_API_URL=http://localhost:8000
```

3. **تشغيل Frontend:**

```bash
npm run dev
```

## اختبار النظام

### 1. تسجيل الدخول كمدير

- افتح http://localhost:5173
- اضغط على أي زر يحتاج تسجيل دخول
- استخدم:
  - Username: `admin`
  - Password: `admin123`

### 2. التصويت

- بعد تسجيل الدخول، اختر مرشحاً
- اضغط على "تأكيد التصويت"
- يجب أن ترى رسالة نجاح

### 3. عرض النتائج (للمدير)

- سجل دخول كمدير
- استخدم API endpoint: `GET /api/admin/results`

## استكشاف الأخطاء

### Backend لا يعمل

1. تحقق من أن MongoDB يعمل:
```bash
docker ps  # إذا استخدمت Docker
# أو
mongosh  # للتحقق من MongoDB محلياً
```

2. تحقق من logs:
```bash
docker logs voting_backend
```

3. تحقق من أن المنفذ 8000 غير مستخدم:
```bash
netstat -an | grep 8000
```

### Frontend لا يتصل بالـ Backend

1. تحقق من أن Backend يعمل على http://localhost:8000
2. افتح Developer Tools في المتصفح وتحقق من Console
3. تحقق من CORS settings في `backend/app/main.py`

### مشاكل في قاعدة البيانات

1. احذف البيانات القديمة:
```bash
docker exec -it voting_mongodb mongosh voting_system --eval "db.dropDatabase()"
```

2. أعد تشغيل seed script:
```bash
docker exec -it voting_backend python -m app.utils.seed
```

## البناء للإنتاج

### Backend

```bash
cd backend
docker build -t voting-backend .
docker run -p 8000:8000 voting-backend
```

### Frontend

```bash
npm run build
# الملفات المبنية ستكون في dist/
```

## الأمان في الإنتاج

⚠️ **مهم جداً:**

1. **غيّر SECRET_KEY:**
   - في `docker-compose.yml` أو `.env`
   - استخدم مفتاح عشوائي قوي

2. **فعّل HTTPS:**
   - استخدم reverse proxy (Nginx)
   - فعّل SSL certificates

3. **حماية MongoDB:**
   - فعّل authentication
   - استخدم firewall
   - لا تعرض MongoDB للإنترنت مباشرة

4. **Rate Limiting:**
   - أضف rate limiting middleware
   - حدد عدد الطلبات المسموحة

## الدعم

إذا واجهت مشاكل:
1. تحقق من logs
2. راجع README.md
3. تحقق من API documentation على /docs
