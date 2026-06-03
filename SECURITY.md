# Security Report & Roadmap (Aequitas)

Dieses Dokument fasst die aktuellen Sicherheitsmaßnahmen und identifizierten, zukunftsgerichteten Sicherheitsthemen ("Größere Themen") für die Aequitas-Plattform zusammen.

## 1. Aktuelle Sicherheits-Audits & Korrekturen
Während einer initialen "Herz-und-Nieren"-Überprüfung der Codebasis wurden die folgenden Punkte identifiziert und direkt behoben:

* **Entfernung von hartcodierten Passwörtern:**
  Hartcodierte Passwörter in Migrationsskripten (z.B. für initiale Admin- oder Testnutzer) und Management-Commands wurden entfernt. Diese werden nun zur Laufzeit über Umgebungsvariablen (`TEST_USER_PASSWORD`, `ADMIN_USER_PASSWORD`) bezogen und z. B. im CI/CD-Prozess per GitHub Secrets injiziert.

* **Privacy by Design / Mandantenfähigkeit (Tenancy):**
  Es wurde sichergestellt, dass Nutzer nur Daten ihrer eigenen Kinder (Dependents) erstellen und abrufen können. Eine Lücke im `CostApprovalViewSet` bei der Erstellung von Kostengutsprachen wurde geschlossen (Validierung, ob der `dependent_id` auch wirklich dem aufrufenden User gehört).

* **Schutz von globalen Konfigurationsdaten:**
  API-Endpunkte für Institutionen und Versicherungen (`InstitutionViewSet`, `InsuranceViewSet`) wurden auf "Read-Only" gesetzt, damit reguläre authentifizierte Nutzer nicht die globalen Datenbestände modifizieren können.

## 2. Zukünftige / Größere Sicherheitsthemen ("Roadmap")
Die folgenden Punkte sind als größere Architekturentscheidungen und Security-Erweiterungen identifiziert worden. Sie sind noch nicht implementiert und auf die Roadmap für zukünftige Sprints gesetzt.

### 2.1 Verschlüsselung von PII (Personenbezogenen Daten) in der Datenbank
Derzeit sind personenbezogene Daten (wie Vornamen, Adressen) im Klartext in der Datenbank gespeichert (aber durch Applikationslogik strikt voneinander getrennt - "Tenancy").
Da es sich bei Aequitas um eine Plattform im Gesundheitsbereich handelt, sollten in Zukunft kritische Identifikatoren oder Gesundheitsdaten (z. B. Diagnosen) auf Datenbankebene verschlüsselt werden (Data at Rest Encryption bzw. Field-Level Encryption).
> **Achtung:** Dies darf nicht als "Einbahn-Hash" geschehen, da die Applikation die Namen im UI anzeigen muss (symmetrische Verschlüsselung erforderlich).

### 2.2 Erweiterte Überwachung & Audit-Logging
Derzeit protokolliert das System Veränderungen an Daten nur in begrenztem Rahmen (z. B. `CostApprovalLog`).
Für höhere Compliance-Anforderungen sollte ein systemweites Audit-Log implementiert werden (Wer hat wann auf welche Patientendaten zugegriffen?).

### 2.3 Zwei-Faktor-Authentifizierung (2FA / MFA)
Sicherheit beim Login: Um Accounts besser abzusichern, sollte eine Multi-Faktor-Authentifizierung über E-Mail, SMS oder Authenticator-Apps integriert werden, bevor Gesundheitsdaten freigeschaltet werden.

### 2.4 Rate Limiting & Brute-Force-Schutz
Für kritische Endpunkte (wie den Login `/api/token/`, oder Passwort-Ändern) sollte ein strikteres API Rate Limiting implementiert werden, um Brute-Force-Attacken zu erschweren. (Aktuell vertrauen wir primär auf die Cloud Run Infrastruktur, aber eine App-basierte Drosselung via `django-ratelimit` oder DRF Throttling wäre ein starkes Plus).
