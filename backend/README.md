# Voting System Backend

FastAPI backend for the Electronic Voting System.

## Setup

### Using Docker

```bash
docker-compose up -d
```

### Manual Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Run seed script:
```bash
python -m app.utils.seed
```

4. Start server:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

- `MONGODB_URL` - MongoDB connection string (default: mongodb://localhost:27017)
- `MONGODB_DB` - Database name (default: voting_system)
- `SECRET_KEY` - JWT secret key (change in production!)

## Default Admin

- Username: `admin`
- Password: `admin123`
