# DevOps & Architektur-Dokumentation

## Übersicht

Aequitas ist als **Monorepo** strukturiert, das aus drei Hauptteilen besteht:
- **`backend/`**: Eine Django (Python) Anwendung, die als Kern-REST-API fungiert und die PostgreSQL-Datenbank verwaltet.
- **`frontend/`**: Eine Vite + React (TypeScript) SPA, die die Benutzeroberfläche bereitstellt.
- **`tests/`**: Enthält End-to-End-Tests (Cypress) und API-Tests (Bruno).

## Infrastruktur

Die Anwendung wird auf der **Google Cloud Platform (GCP)** mit **Cloud Run** bereitgestellt.
- Sowohl das Backend als auch das Frontend sind mit Docker containerisiert und in der **Artifact Registry** gespeichert.
- Cloud Run verwaltet die serverlose Skalierung und Bereitstellung dieser Container.
- Die PostgreSQL-Datenbank wird von GCP verwaltet und vom Backend-Dienst sicher aufgerufen.

## CI/CD Pipeline

Wir verwenden **GitHub Actions** für Continuous Integration und Continuous Deployment. Der Haupt-Workflow ist in `.github/workflows/deploy.yml` definiert.

### Deployment Flow

Der Workflow wird bei Pushes auf die Branches `test` und `prod` ausgelöst.

1. **Test-Umgebung (`test` Branch)**
   - **Trigger:** Push auf den `test` Branch.
   - **Build:** Docker-Images für Backend und Frontend werden mit Buildx und GitHub Actions Caching (`type=gha`) erstellt und in die Artifact Registry verschoben (`aequitas-backend-test`, `aequitas-frontend-test`).
   - **Deploy:** Die Images werden auf Google Cloud Run bereitgestellt.
   - **Database Seeding:** Ein Cloud Run Job (`aequitas-seed-test`) wird ausgelöst, um `python manage.py seed_test_user` auszuführen und Daten für Tests vorzubereiten.
   - **Testing:**
     - **Cypress:** End-to-End-Tests werden gegen die neu bereitgestellten Test-URLs von Frontend und Backend ausgeführt. Die Ergebnisse werden in Cypress Cloud aufgezeichnet.
     - **Bruno:** API-Tests werden gegen die bereitgestellte Backend-API ausgeführt. Die Ergebnisse werden in der GitHub Actions Zusammenfassung veröffentlicht. Wenn sie fehlschlagen, wird ein Artefakt mit den Testergebnissen generiert, um die Fehlersuche zu erleichtern.

2. **Produktions-Umgebung (`prod` Branch)**
   - **Trigger:** Push auf den `prod` Branch.
   - **Build & Deploy:** Ähnlich wie in der Test-Umgebung, wobei Buildx-Caching genutzt wird, aber es zielt auf die produktiven Artifact Registry Images (`aequitas-backend-prod`, `aequitas-frontend-prod`) und Cloud Run Dienste (`aequitas-backend`, `aequitas-frontend`) ab.

## Lokale Entwicklungsstruktur

Um die Anwendung lokal auszuführen, siehe die Datei `docker-compose.yml` im Stammverzeichnis. Sie richtet die Datenbank, die Backend-API und einen Frontend-Live-Preview-Proxy ein.

## Wartung

### Branch Cleanup
Veraltete Feature-Branches sollten regelmäßig gelöscht werden, sobald sie in `test` gemerged wurden. Siehe `DevOps.md` für Cleanup-Skripte.
