You are acting as a Senior Software Architect and Technical Lead.

Your task is to audit the ENTIRE codebase and produce a complete implementation report of the project's CURRENT state.

IMPORTANT RULES

- Analyze the ACTUAL code only.
- Do NOT assume features exist.
- Do NOT describe planned features unless implementation already exists.
- If something is partially implemented, explicitly state that it is partial.
- If a feature is missing, state that it is not implemented.
- Every statement must be based on the existing codebase.

==================================================
PROJECT AUDIT REPORT
==================================================

Produce ONE well-structured Markdown document.

# 1. Project Overview

- Purpose of the project
- Current architecture
- Tech stack
- Major frameworks
- Current maturity level
- High-level implementation status

-----------------------------------

# 2. Folder Structure

Explain every major folder and its responsibility.

Include:

- backend/
- frontend/ (if exists)
- app/
- services/
- routes/
- models/
- schemas/
- utils/
- ml/
- uploads/
- configs
- scripts
- docs

-----------------------------------

# 3. Database

Describe ONLY existing database implementation.

Include:

- Tables
- Relationships
- Constraints
- Indexes
- Enums
- Current migration strategy
- ORM models
- Missing migrations (if any)

-----------------------------------

# 4. Authentication & Authorization

Explain:

- JWT implementation
- Password hashing
- User model
- Roles
- Permissions
- Dependencies
- Security middleware
- Current RBAC implementation
- Missing security features

-----------------------------------

# 5. API

List every implemented endpoint grouped by module.

For each endpoint include:

- URL
- Method
- Purpose
- Authentication required?
- Roles required?
- Request model
- Response model

-----------------------------------

# 6. AI Pipeline

Describe the complete processing pipeline exactly as implemented.

Include:

- OCR
- Classification
- Extraction
- Storage
- Notifications
- Workflow
- Human review
- Logs

Mention the execution order.

-----------------------------------

# 7. OCR

Explain:

- Supported file types
- Libraries
- Workflow
- Limitations

-----------------------------------

# 8. Machine Learning

Describe:

- Dataset
- Training process
- Feature engineering
- Model
- Confidence calculation
- Saved artifacts

-----------------------------------

# 9. NLP & Information Extraction

Explain:

- Regex
- spaCy
- Heuristics
- Current extraction capabilities
- Supported document types

-----------------------------------

# 10. Services Layer

Explain the responsibility of every service.

Include interaction between services.

-----------------------------------

# 11. Background Processing

Explain:

- BackgroundTasks usage
- Async usage
- Blocking operations
- Pipeline execution

-----------------------------------

# 12. Notifications

Describe current notification implementation.

-----------------------------------

# 13. Human Review

Describe:

- Approval process
- Verification process
- Review workflow

-----------------------------------

# 14. Logging

Explain:

- Logging configuration
- Where logs are generated
- Missing observability

-----------------------------------

# 15. Configuration

Explain:

- Environment variables
- Config classes
- Secrets management

-----------------------------------

# 16. Error Handling

Explain:

- Validation
- Exception handling
- Custom exceptions
- Response consistency

-----------------------------------

# 17. Current Architecture Evaluation

Evaluate:

- Separation of concerns
- Maintainability
- Scalability
- Readability
- Testability
- Security

Give strengths and weaknesses.

-----------------------------------

# 18. Production Readiness Audit

For every category assign one of:

✅ Complete

🟡 Partial

❌ Missing

Evaluate:

Authentication

Authorization

RBAC

Database

Migrations

Storage

Logging

Monitoring

Testing

Docker

CI/CD

API Design

Validation

Documentation

Background Jobs

Security

AI Pipeline

OCR

ML

Frontend

Deployment

Configuration

Caching

Rate Limiting

Health Checks

Performance

Search

Observability

-----------------------------------

# 19. Implemented Features

List ONLY completed features.

-----------------------------------

# 20. Partially Implemented Features

List features that exist but are incomplete.

-----------------------------------

# 21. Missing Features

List major production features that do not yet exist.

-----------------------------------

# 22. Technical Debt

Identify:

- duplicated code
- code smells
- architectural issues
- potential bugs
- scalability concerns

-----------------------------------

# 23. Overall Progress

Estimate overall completion percentages.

Example format:

Backend Core:
XX%

Authentication:
XX%

AI Pipeline:
XX%

Database:
XX%

API:
XX%

Production Readiness:
XX%

Frontend:
XX%

Overall Project:
XX%

For each percentage, explain the reasoning based on the implementation found.

-----------------------------------

# 24. Recommended Next Steps

Provide a prioritized roadmap.

Priority 1 → Critical

Priority 2 → High

Priority 3 → Medium

Priority 4 → Nice to Have

Only recommend work that logically follows the current implementation.

==================================================

The report should be factual, implementation-based, and comprehensive. Do not invent features or speculate. If uncertain, explicitly state that the implementation could not be verified from the codebase.