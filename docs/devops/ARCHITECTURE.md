# DevOps & Architecture Documentation

## Overview

Aequitas is structured as a **Monorepo** consisting of three main parts:
- **`backend/`**: A Django (Python) application acting as the core REST API and managing the PostgreSQL database.
- **`frontend/`**: A Vite + React (TypeScript) SPA that provides the user interface.
- **`tests/`**: Contains End-to-End tests (Cypress) and API tests (Bruno).

## Infrastructure

The application is deployed on **Google Cloud Platform (GCP)** using **Cloud Run**.
- Both the Backend and Frontend are containerized using Docker and stored in the **Artifact Registry**.
- Cloud Run manages the serverless scaling and deployment of these containers.
- The PostgreSQL database is managed by GCP and securely accessed by the Backend service.

## CI/CD Pipeline

We use **GitHub Actions** for Continuous Integration and Continuous Deployment. The main workflow is defined in `.github/workflows/deploy.yml`.

### Deployment Flow

The workflow triggers on pushes to the `test` and `prod` branches.

1. **Test Environment (`test` branch)**
   - **Trigger:** Push to the `test` branch.
   - **Build:** Docker images for Backend and Frontend are built using Buildx with GitHub Actions caching (`type=gha`), and pushed to Artifact Registry (`aequitas-backend-test`, `aequitas-frontend-test`).
   - **Deploy:** Images are deployed to Google Cloud Run.
   - **Database Seeding:** A Cloud Run Job (`aequitas-seed-test`) is triggered to run `python manage.py seed_test_user` to prepare data for testing.
   - **Testing:**
     - **Cypress:** End-to-End tests are executed against the newly deployed Test Frontend and Backend URLs. Results are recorded to Cypress Cloud.
     - **Bruno:** API tests are run against the deployed Backend API. Results are published to the GitHub Actions summary. If they fail, an artifact with the test results is generated to aid debugging.

2. **Production Environment (`prod` branch)**
   - **Trigger:** Push to the `prod` branch.
   - **Build & Deploy:** Similar to the Test environment, utilizing Buildx caching, but targets production Artifact Registry images (`aequitas-backend-prod`, `aequitas-frontend-prod`) and Cloud Run services (`aequitas-backend`, `aequitas-frontend`).

## Local Development Structure

To run the application locally, refer to the `docker-compose.yml` file in the root directory. It sets up the database, backend API, and a frontend live-preview proxy.

## Maintenance

### Branch Cleanup
Stale feature branches should be deleted regularly once they are merged into `test`. See `DevOps.md` for cleanup scripts.
