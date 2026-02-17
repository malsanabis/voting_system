# نظام التصويت الإلكتروني - Electronic Voting System

نظام تصويت إلكتروني كامل مع Frontend (React + TypeScript) و Backend (FastAPI + MongoDB)

## هيكل المشروع

```
User/
├── src/                          # Frontend - React + TypeScript
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── services/
│   │   └── api.ts                 # API service layer
│   ├── hooks/
│   │   ├── useCandidates.ts      # Candidates hook
│   │   └── useVoting.ts          # Voting hook
│   ├── components/
│   │   └── LoginModal.tsx        # Login component
│   └── page/
│       ├── index.tsx             # Main voting UI
│       └── index.css
├── backend/                      # Backend - FastAPI + MongoDB
│   ├── app/
│   │   ├── main.py               # FastAPI app
│   │   ├── models/               # Pydantic models
│   │   │   ├── user.py
│   │   │   ├── candidate.py
│   │   │   └── vote.py
│   │   ├── routes/               # API routes
│   │   │   ├── auth.py
│   │   │   ├── candidates.py
│   │   │   ├── votes.py
│   │   │   └── admin.py
│   │   ├── services/             # Business logic
│   │   │   ├── database.py
│   │   │   └── jwt_handler.py
│   │   ├── utils/
│   │   │   └── seed.py           # Database seed script
│   │   └── middleware/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml             # Docker setup
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── README.md
```

## المشاريع

### 1. نظام التصويت (Voting System)
مشروع رئيسي لإدارة عملية التصويت الإلكتروني:
- واجهة التصويت للمرشحين
- اختيار المناصب المختلفة
- تأكيد وإلغاء التصويت
- صفحة إدخال رقم الهوية

### 2. إدارة المستخدمين (User Management)
نظام إدارة المستخدمين والمرشحين:
- تسجيل الدخول
- إضافة مستخدمين جدد
- إضافة مرشحين
- البحث عن المرشحين
- إدارة قوائم المرشحين

## التقنيات المستخدمة

### Frontend
- **React 18.2.0** - مكتبة واجهة المستخدم
- **TypeScript 5.1.3** - لغة البرمجة
- **Vite 4.3.9** - أداة البناء والتطوير
- **Tailwind CSS 3.3.4** - إطار عمل CSS

### Backend
- **FastAPI** - إطار عمل Python للـ API
- **MongoDB** - قاعدة البيانات
- **Motor** - MongoDB async driver
- **JWT** - مصادقة المستخدمين
- **bcrypt** - تشفير كلمات المرور
- **Pydantic** - التحقق من البيانات

## التثبيت والتشغيل

### الطريقة 1: استخدام Docker (موصى بها)

1. **تشغيل Backend و MongoDB:**
```bash
docker-compose up -d
```

2. **تهيئة قاعدة البيانات:**
```bash
# تشغيل seed script
docker exec -it voting_backend python -m app.utils.seed
```

3. **تشغيل Frontend:**
```bash
npm install
npm run dev
```

4. **الوصول للتطبيق:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### الطريقة 2: التثبيت اليدوي

#### Backend Setup

1. **تثبيت Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **إعداد MongoDB:**
   - تأكد من تشغيل MongoDB على `localhost:27017`
   - أو قم بتعديل `MONGODB_URL` في `.env`

3. **تهيئة قاعدة البيانات:**
```bash
python -m app.utils.seed
```

4. **تشغيل Backend:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. **تثبيت المكتبات:**
```bash
npm install
```

2. **تشغيل Frontend:**
```bash
npm run dev
```

3. **بناء للإنتاج:**
```bash
npm run build
```

## بيانات تسجيل الدخول الافتراضية

- **المدير (Admin):**
  - Username: `admin`
  - Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - معلومات المستخدم الحالي

### Candidates
- `GET /api/candidates` - جميع المرشحين
- `GET /api/candidates/{category}` - المرشحين حسب الفئة
- `GET /api/candidates/{id}/detail` - تفاصيل مرشح

### Votes
- `POST /api/votes` - إرسال تصويت (يتطلب JWT)
- `GET /api/votes/my-votes` - تصويتاتي

### Admin (يتطلب صلاحيات admin)
- `GET /api/admin/results` - إحصائيات التصويت
- `POST /api/admin/candidates` - إضافة مرشح
- `PUT /api/admin/candidates/{id}` - تحديث مرشح
- `DELETE /api/admin/candidates/{id}` - حذف مرشح

## فئات المرشحين (Categories)

- `chairman` - رئيس مجلس الإدارة
- `secretary` - أمين السر
- `treasurer` - الأمين المالي
- `vice_president` - نائب الرئيس
- `representative` - ممثل

## الأمان

- **JWT Tokens:** صلاحية 24 ساعة
- **Password Hashing:** باستخدام bcrypt
- **CORS:** مفعّل لـ `http://localhost:5173`
- **Vote Validation:** منع التصويت المكرر في نفس الفئة

## الملفات المهمة

### المشروع الرئيسي (نظام التصويت)
- `vite.config.js` - إعدادات Vite
- `tailwind.config.js` - إعدادات Tailwind CSS
- `postcss.config.js` - إعدادات PostCSS
- `tsconfig.json` - إعدادات TypeScript
- `.gitignore` - ملفات مستبعدة من Git
- `package.json` - معلومات المشروع والتبعيات

### مشروع إدارة المستخدمين
- جميع الملفات المذكورة أعلاه موجودة أيضًا في مجلد `User Management/`

## ملاحظات

- كل مشروع مستقل وله ملفات التكوين الخاصة به
- المشروع يدعم اللغة العربية (RTL)
- يستخدم خطوط Google Fonts (Cairo, Public Sans, وغيرها)
# voting_system
