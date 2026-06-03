# DevOps & Architektur Dokumentation

## Übersicht

Aequitas ist als **Monorepo** strukturiert und besteht aus drei Hauptteilen:
- **`backend/`**: Eine Django (Python) Applikation, die als zentrale REST-API dient und die PostgreSQL-Datenbank verwaltet.
- **`frontend/`**: Eine Vite + React (TypeScript) SPA (Single Page Application), welche die Benutzeroberfläche bereitstellt.
- **`tests/`**: Beinhaltet End-to-End-Tests (Cypress) und API-Tests (Bruno).

## Infrastruktur

Die Applikation wird auf der **Google Cloud Platform (GCP)** mittels **Cloud Run** gehostet.
- Sowohl das Backend als auch das Frontend sind mit Docker containerisiert und in der **Artifact Registry** gespeichert.
- Cloud Run übernimmt die serverlose Skalierung und das Deployment dieser Container.
- Die PostgreSQL-Datenbank wird von GCP verwaltet und sicher vom Backend-Service angesprochen.

## CI/CD Pipeline

Für Continuous Integration und Continuous Deployment nutzen wir **GitHub Actions**. Der Haupt-Workflow ist in `.github/workflows/deploy.yml` definiert.

### Deployment Ablauf

Der Workflow wird bei Pushes auf die Branches `test` und `prod` ausgelöst.

1. **Test-Umgebung (`test` Branch)**
   - **Auslöser:** Push auf den `test` Branch.
   - **Build:** Docker-Images für Backend und Frontend werden gebaut und in die Artifact Registry gepusht (`aequitas-backend-test`, `aequitas-frontend-test`).
   - **Deploy:** Images werden auf Google Cloud Run deployt.
   - **Database Seeding:** Ein Cloud Run Job (`aequitas-seed-test`) wird gestartet, um mit `python manage.py seed_test_user` Testdaten bereitzustellen.
   - **Testing:**
     - **Cypress:** End-to-End-Tests werden gegen die soeben deployten Test-Frontend- und Backend-URLs ausgeführt. Ergebnisse werden in der Cypress Cloud aufgezeichnet.
     - **Bruno:** API-Tests laufen gegen die deployte Backend-API. Die Ergebnisse werden im GitHub Actions Summary veröffentlicht.

2. **Produktions-Umgebung (`prod` Branch)**
   - **Auslöser:** Push auf den `prod` Branch.
   - **Build & Deploy:** Ähnlich wie in der Test-Umgebung, zielt jedoch auf die Produktions-Images in der Artifact Registry (`aequitas-backend-prod`, `aequitas-frontend-prod`) und die produktiven Cloud Run Services ab (`aequitas-backend`, `aequitas-frontend`).

## Lokale Entwicklung

Für das lokale Setup der Applikation existiert eine `docker-compose.yml` Datei im Hauptverzeichnis. Diese startet die Datenbank, die Backend-API sowie einen Frontend-Live-Preview-Proxy.

## Wartung (Maintenance)

### Branch-Bereinigung
Veraltete Feature-Branches sollten regelmässig gelöscht werden, sobald sie in `main` oder `test` gemerged wurden. Die Skripte zur Bereinigung finden sich in der `DevOps.md` im Hauptverzeichnis.

### Kontinuierliche Verbesserung
Zukünftige Updates der CI/CD-Pipeline sollten Docker Layer Caching (z.B. mittels `type=gha`) in Betracht ziehen, um die Ausführungszeit der GitHub Actions signifikant zu reduzieren.
