# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/hanzlasohaib/smart-document-workflow-ai/compare/v2.0.0...HEAD)

## [2.0.0](https://github.com/hanzlasohaib/smart-document-workflow-ai/compare/v1.9.0...v2.0.0) - 2026-08-21

### Added

- Process overview section on the marketing landing page (upload, review, approve).
- Lighthouse CI quality gates after the frontend build (Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO ≥ 95), with HTML reports uploaded as workflow artifacts.

### Changed

- Marketing landing page UX, accessibility, and performance.
- Login and signup experience.
- Dashboard and portal polish: shell, headers, and loading states; document views; upload dropzone, progress, and error feedback; review of extracted fields, source text, and decisions.

## [0.1.0](https://github.com/hanzlasohaib/smart-document-workflow-ai/releases/tag/v0.1.0) - 2026-08-20

### Added

- Initial product: document upload, OCR, classification, field extraction, human review, and gated approval.
- Next.js marketing pages, authentication, user portal, and admin portal.
- FastAPI API under `/api/v1` with JWT auth and BFF refresh cookies.
- Notifications for processing and decision events.
- Docker Compose local stack and GitHub Actions CI for backend tests, frontend lint/build, and Docker images.

