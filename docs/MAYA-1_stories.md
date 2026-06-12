# MAYA-1: UAT Aufsetzen

**Ziel:** Es soll eine UAT Umgebung aufgebaut werden. Ebenfalls in Google Run. Im Vergleich zu Test soll sich folgendes Ändern:
- Als Datenbank soll Postgres genommen werden (als Backend Service in CloudRun)
- Die Daten sollten bei Deployment nicht gelöscht werden

## Erstellte User Stories

### MAYA-2: UAT-Umgebung und PostgreSQL-Datenbank in Google Cloud Run bereitstellen
**Beschreibung:**
Als DevOps-Engineer möchte ich eine dedizierte UAT-Umgebung in Google Cloud Run inklusive einer PostgreSQL-Datenbank aufbauen, damit wir eine produktionsnahe Testumgebung für Abnahmetests haben.

**Akzeptanzkriterien:**
* Eine neue Google Cloud Run Umgebung für UAT ist aufgesetzt.
* Ein PostgreSQL-Backend-Service läuft und ist sicher mit der Cloud Run Instanz verbunden.
* Eine persistente Speicherlösung für die Datenbank ist konfiguriert (Daten überleben ein Re-Deployment).

---

### MAYA-3: GitHub Actions Pipeline für UAT-Deployment erstellen
**Beschreibung:**
Als Entwickler möchte ich, dass die UAT-Umgebung automatisch via GitHub Actions bereitgestellt wird, um manuelle Fehler zu reduzieren und reproduzierbare Deployments zu garantieren.

**Akzeptanzkriterien:**
* Ein GitHub Action Workflow für das UAT-Environment existiert.
* Das Deployment erfolgt vollautomatisch bei definierten Triggern (z.B. Push auf einen bestimmten Branch oder manueller Trigger).

---

### MAYA-4: E2E- und API-Tests in die UAT-Pipeline integrieren und Testdaten-Cleanup sicherstellen
**Beschreibung:**
Als QA-Engineer möchte ich, dass unsere bestehenden E2E- und API-Tests auch auf der UAT-Umgebung automatisch laufen und dass Testdaten am Ende wieder entfernt werden, um eine saubere Datenbank für manuelle UAT-Tests zu erhalten.

**Akzeptanzkriterien:**
* Die GitHub Action führt E2E- (Cypress) und API-Tests (Bruno) gegen die UAT-URL aus.
* Es existiert ein Mechanismus (z.B. Setup-/Teardown-Skripte in den Tests oder ein dedizierter Teardown-Schritt in der Pipeline), der sämtliche angelegten Testdaten nach Durchlauf der Tests zuverlässig aus der PostgreSQL-Datenbank löscht.
