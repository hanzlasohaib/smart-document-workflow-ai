# 🚀 Smart Document Processing & Workflow Automation System (AI Backend)

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue.svg)
![License](https://img.shields.io/badge/License-Educational-green.svg)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

---

# 📌 Project Overview

An **AI-powered backend platform** designed for intelligent document processing, information extraction, and workflow automation.

This project simulates a **real-world enterprise document management pipeline** where uploaded documents are automatically processed through OCR, AI classification, NLP extraction, workflow triggering, notifications, logging, and human verification systems.

The system is built using modern backend technologies with a scalable architecture focused on:

- OCR-based text extraction
- Machine Learning document classification
- NLP-driven data extraction
- Workflow automation
- Human review & approval systems
- Audit logging & notifications

---

# 🎯 Core Objectives

The system is capable of:

✔ Uploading PDF/Image documents  
✔ Extracting text using OCR  
✔ Classifying documents using AI/ML  
✔ Extracting structured information using NLP  
✔ Automating workflows based on document type  
✔ Managing human review & approval processes  
✔ Generating notifications & audit logs  
✔ Storing all processed data securely in PostgreSQL  

---

# 🧠 Key Features

---

## 🔐 Authentication & Authorization

- JWT-based authentication
- Secure password hashing
- Role-Based Access Control (RBAC)
- Protected API routes
- Admin/User permissions

---

## 📂 Document Management

- Upload PDF and image files
- UUID-based file storage
- User-document relationship management
- File metadata tracking
- Organized upload directory system

---

## 🧾 OCR Processing Engine

Extracts text from uploaded documents using:

- `pytesseract`
- `pdf2image`
- `Pillow`

### Supported Inputs

- PDF files
- PNG/JPG/JPEG images
- Scanned documents

### OCR Flow

```text
Document Upload
      ↓
PDF/Image Conversion
      ↓
OCR Text Extraction
      ↓
Cleaned Text Output
```

---

## 🤖 AI Document Classification

Automatically classifies uploaded documents into categories such as:

- Resume
- Invoice
- Form

### ML Technologies Used

- TF-IDF Vectorization
- Logistic Regression
- scikit-learn

### AI Output

- Predicted document type
- Confidence score
- Processing metadata

### Example

```json
{
  "document_type": "Invoice",
  "confidence": 0.92
}
```

---

## 🧩 NLP-Based Information Extraction

Structured data extraction using:

- Regex
- spaCy Named Entity Recognition (NER)

---

### 📄 Resume Extraction

Extracted fields:

- Name
- Email
- Phone Number
- Skills (optional)
- Experience (optional)

---

### 🧾 Invoice Extraction

Extracted fields:

- Invoice Number
- Amount
- Date
- Vendor Name

---

### 📋 Form Extraction

Extracted fields:

- Name
- Date
- Form ID
- Department

---

## ⚙️ Workflow Automation

Automatically triggers workflows based on document classification.

| Document Type | Triggered Workflow |
|---------------|-------------------|
| Resume | HR Recruitment Pipeline |
| Invoice | Finance Approval Pipeline |
| Form | Internal Processing Pipeline |

### Workflow Capabilities

- Auto-routing
- Status updates
- Action logging
- Approval handling
- Notification generation

---

## 👨‍💼 Human Review & Approval System

Confidence-based review system for extracted fields.

### Features

- Manual field verification
- Approval/rejection system
- Editable extracted values
- Pending review queue
- Admin moderation

### Approval States

- Pending
- Approved
- Rejected

---

## 🔔 Notification System

Generates notifications after important actions.

### Examples

- Document processed
- Approval completed
- Workflow triggered
- Review required

### Features

- Read/unread status
- User-based notifications
- Timestamp tracking

---

## 📊 Audit Logging System

Tracks all major system activities.

### Logs Include

- Workflow events
- Approval actions
- Processing history
- User activities
- Error tracking

### Benefits

- System observability
- Traceability
- Enterprise-style monitoring

---

# 🏗 System Architecture

```text
                ┌──────────────────┐
                │  Document Upload │
                └────────┬─────────┘
                         ↓
                ┌──────────────────┐
                │   OCR Engine     │
                └────────┬─────────┘
                         ↓
                ┌──────────────────┐
                │ AI Classification│
                └────────┬─────────┘
                         ↓
                ┌──────────────────┐
                │ NLP Extraction   │
                └────────┬─────────┘
                         ↓
                ┌──────────────────┐
                │ PostgreSQL DB    │
                └────────┬─────────┘
                         ↓
         ┌───────────────┼────────────────┐
         ↓                                ↓
┌──────────────────┐          ┌──────────────────┐
│ Notification Sys │          │   Audit Logs     │
└────────┬─────────┘          └────────┬─────────┘
         ↓                              ↓
         └──────────────┬──────────────┘
                        ↓
             ┌──────────────────┐
             │ Human Review Sys │
             └────────┬─────────┘
                      ↓
             ┌──────────────────┐
             │ Workflow Engine  │
             └──────────────────┘
```

---

# 🛠 Tech Stack

---

## ⚡ Backend Technologies

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic v2
- JWT Authentication

---

## 🤖 AI / NLP Technologies

- scikit-learn
- spaCy
- Regex
- TF-IDF
- Logistic Regression

---

## 🧾 OCR Technologies

- pytesseract
- pdf2image
- Pillow

---

## 🧰 Development Tools

- Alembic
- Uvicorn
- Git & GitHub
- Python Virtual Environment

---

# 📂 Project Structure

```text
backend/
│
├── app/
│   ├── core/              # Configurations & security
│   ├── db/                # Database setup
│   ├── models/            # SQLAlchemy models
│   ├── routes/            # API routes
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic
│   ├── utils/             # Utility/helper functions
│   ├── workflows/         # Workflow automation
│   ├── notifications/     # Notification services
│   └── main.py            # FastAPI entry point
│
├── ml/
│   ├── train_model.py
│   └── document_classifier.pkl
│
├── uploads/
├── alembic/
├── requirements.txt
└── README.md
```

---

# ⚙️ Installation Guide

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/hanzlasohaib/Smart-Document-Workflow-AI.git

cd Smart-Document-Workflow-AI/backend
```

---

## 2️⃣ Create Virtual Environment

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

---

## 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🧾 Environment Variables

Create a `.env` file inside the backend directory:

```env
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://postgres:password@localhost/db_name
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_DIR=uploads
```

---

# 🗄 Database Setup

Initialize the database:

```bash
python -m app.db.init_db
```

Run Alembic migrations:

```bash
alembic upgrade head
```

---

# 🤖 Train ML Model

```bash
python ml/train_model.py
```

This generates:

```text
document_classifier.pkl
```

---

# ▶️ Run Development Server

```bash
uvicorn app.main:app --reload
```

---

## 🌐 Server URLs

### API Base URL

```text
http://127.0.0.1:8000
```

### Swagger Documentation

```text
http://127.0.0.1:8000/docs
```

### ReDoc Documentation

```text
http://127.0.0.1:8000/redoc
```

---

# 📡 API Endpoints

---

# 🔐 Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login & get JWT token |

---

# 📄 Document APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents/upload` | Upload document |
| GET | `/documents/my` | User documents |
| GET | `/documents/` | Admin document list |

---

# 📋 Review APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/document/{doc_id}` | Get document details |
| PUT | `/field/{field_id}` | Update extracted field |

---

# ✅ Approval APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents/{id}/approve` | Approve document |
| POST | `/documents/{id}/reject` | Reject document |
| GET | `/documents/pending` | Pending approvals |

---

# 🔔 Notification APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications/` | Get notifications |
| PUT | `/notifications/{id}/read` | Mark as read |

---

# 🧠 AI Processing Pipeline

Main processing function:

```python
process_document_pipeline(document_id)
```

---

## Processing Flow

```text
OCR
  ↓
Classification
  ↓
Information Extraction
  ↓
Database Storage
  ↓
Notifications
  ↓
Audit Logs
  ↓
Human Review
  ↓
Workflow Automation
```

---

# 📊 Current System Status

| Feature | Status |
|---------|--------|
| OCR Processing | ✅ Complete |
| ML Classification | ✅ Complete |
| NLP Extraction | ✅ Complete |
| Workflow Automation | ✅ Complete |
| Human Review System | ✅ Complete |
| Notification System | ✅ Complete |
| Audit Logs | ✅ Complete |
| Approval Engine | ✅ Complete |
| Async Queue | ❌ Pending |
| Frontend Dashboard | ❌ Pending |

---

# 🚀 Future Improvements

## Planned Enhancements

- React Frontend Dashboard
- Celery + Redis async processing
- Real-time notifications using WebSockets
- Event-driven architecture
- Transformer-based NLP models
- Docker containerization
- Kubernetes deployment
- CI/CD pipelines
- Elasticsearch integration
- Cloud deployment (AWS/Azure)

---

# 🧪 Example Workflow

```text
User uploads Invoice.pdf
        ↓
OCR extracts text
        ↓
AI classifies document as Invoice (92%)
        ↓
NLP extracts:
    - Invoice Number
    - Amount
    - Date
        ↓
Stored in PostgreSQL
        ↓
Notification generated
        ↓
Finance workflow triggered
        ↓
Admin approval process starts
```

---

# 🔐 Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Role-Based Access Control
- Input Validation
- Secure File Handling
- UUID-based filenames

---

# 📈 Project Status

## Current Stage

✅ Backend Architecture Complete  
✅ AI Processing Pipeline Complete  
✅ Human Review System Complete  
✅ Approval Engine Complete  
✅ Notification System Complete  
✅ Audit Logging Complete  

### In Progress

- Async Task Queue
- Frontend Dashboard
- Deployment Pipeline

---

# 👨‍💻 Author

## Hanzla Sohaib

### GitHub

```text
https://github.com/hanzlasohaib
```

### LinkedIn

```text
https://www.linkedin.com/in/hanzlasohaib
```

---

# 📄 License

This project is developed for:

- Educational purposes
- Learning AI backend systems
- Portfolio showcasing
- Research & experimentation

---

# ⭐ Final Note

This project evolved from a simple OCR-based processor into a complete:

# 💡 AI-Powered Document Intelligence & Workflow Automation Platform

It demonstrates:

- AI + NLP integration
- Enterprise backend architecture
- Real-world workflow automation
- Human-in-the-loop AI systems
- Secure API development
- Production-oriented backend engineering

---