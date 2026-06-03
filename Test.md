# Teststrategie: Aequitas

Diese Teststrategie beschreibt den methodischen Ansatz zur Qualitätssicherung (QA) für das Projekt Aequitas. Ziel ist es, Entwicklern einen Leitfaden an die Hand zu geben, um durch gezielte API-Tests (Bruno) und End-to-End-Tests (Cypress) möglichst viele Fehler und Edge-Cases frühzeitig aufzudecken. Besonderes Augenmerk liegt dabei auf den aktuell implementierten Modulen, der Sicherheit (Mandantentrennung) sowie der Barrierefreiheit für Nutzer mit eingeschränkter Mobilität.

## 1. Methodischer Ansatz

Die QA-Strategie basiert auf zwei Säulen:

1.  **API-Testing (Bruno):** Fokus auf Geschäftslogik, Datenvalidierung, Berechtigungen (Tenant Isolation) und Performance am Backend.
2.  **E2E-Testing (Cypress):** Fokus auf User Journeys, UI-Interaktionen, Frontend-Zustandsverwaltung und Barrierefreiheit (Accessibility).

### Grundprinzipien für alle Tests
*   **"Listen to the Data":** Tests müssen reale oder realitätsnahe Datenstrukturen abbilden.
*   **Self-Contained State:** Jeder Test muss seinen eigenen Zustand generieren (z. B. durch Erstellen spezifischer Testbenutzer, Auth-Tokens) und am Ende aufräumen, um Nebenwirkungen zwischen Tests zu vermeiden.
*   **Positiv- und Negativtests:** Jeder Endpunkt und jede User Journey muss sowohl den "Happy Path" (Erfolgsfall) als auch Fehlerfälle (z. B. fehlende Felder, unautorisierter Zugriff, ungültige Formate) testen.
*   **Automatisierung:** Alle Tests müssen so konzipiert sein, dass sie in CI/CD-Pipelines (GitHub Actions) vollautomatisiert ausgeführt werden können.

---

## 2. API-Testing mit Bruno

Bruno wird verwendet, um die Django REST Framework APIs zu testen.

### 2.1 Fokusbereiche für API-Tests

*   **Tenant Isolation (Mandantenfähigkeit):** Dies ist sicherheitskritisch. Es muss rigoros getestet werden, dass ein Benutzer **niemals** auf die Daten (Dependents, Health Records, Cost Approvals) eines anderen Benutzers zugreifen oder diese verändern kann.
*   **Eingabevalidierung:** Prüfung, ob das Backend ungültige Daten korrekt abfängt und hilfreiche Fehlermeldungen zurückgibt.
*   **Rollen und Berechtigungen:** Überprüfung, ob nur berechtigte Rollen (z. B. Staff-User) bestimmte Endpunkte (wie globale Referenzdaten) verändern dürfen.

### 2.2 Konkrete Test-Szenarien (Aktuelle Module)

#### Core-Modul (Benutzer, Profile, Dependents)
*   **AHV-Nummern-Validierung:**
    *   *Positiv:* Anlage eines Dependents mit gültiger AHV-Nummer (`756.xxxx.xxxx.xx`).
    *   *Negativ:* Versuch, AHV-Nummern in falschen Formaten (ohne Punkte, zu kurz, falscher Präfix) zu speichern.
*   **Tenant Isolation bei Dependents:**
    *   *Test:* User A erstellt ein Kind. User B versucht über einen GET/PATCH/DELETE-Request mit der ID des Kindes von User A darauf zuzugreifen.
    *   *Erwartet:* 404 Not Found oder 403 Forbidden für User B.

#### Health-Modul (Gesundheitsdaten)
*   **Datenintegrität:**
    *   *Test:* Anlegen eines `HealthRecord` mit Datum in der Zukunft (falls logisch nicht erlaubt) oder mit fehlerhaften Metrik-Zuweisungen.
    *   *Erwartet:* Korrekte Abweisung mit 400 Bad Request.
*   **Paginierung und Limits:**
    *   *Test:* Abfragen von Listen mit vielen Einträgen (z. B. >100). Funktionieren Paginierung und Limit/Offset-Parameter korrekt?

#### Settlement-Modul (Kostengutsprachen)
*   **Status-Übergänge:**
    *   *Test:* Versuch, den Status eines `CostApproval` von einem ungültigen Zustand in einen anderen zu überführen (z. B. direkt von `neu` zu `abgelehnt` ohne Zwischenschritt, falls dies die Logik verbietet).
*   **Referenzdaten-Schutz:**
    *   *Test:* Regulärer Benutzer versucht, per POST-Request eine neue `Institution` oder `Versicherung` anzulegen.
    *   *Erwartet:* 403 Forbidden (da dies nur über das Admin-Panel möglich sein soll).

---

## 3. E2E-Testing mit Cypress

Cypress wird verwendet, um die Plattform aus Sicht des Endbenutzers zu testen.

### 3.1 Fokusbereiche für E2E-Tests

*   **User Journeys:** Reibungsloser Ablauf der Kernprozesse (Login, Datenerfassung, Formularversand).
*   **Fehler-UI:** Werden Fehler (z. B. durch fehlende Netzwerkanbindung oder Backend-Fehler) im Frontend adäquat und verständlich angezeigt?
*   **Internationalisierung (i18n):** Funktionieren die dynamischen UI-Übersetzungen (aus der DB geladen) im Frontend? Werden Fallbacks genutzt, wenn Keys fehlen?

### 3.2 Barrierefreiheit (Accessibility - a11y)

Ein zentraler Aspekt der Plattform ist die Zugänglichkeit für Eltern, insbesondere solche mit eigener eingeschränkter Mobilität oder anderen Einschränkungen. Wir integrieren **cypress-axe** zur automatisierten Prüfung der Barrierefreiheit.

#### Implementierung in Cypress
1.  Installation: `npm install --save-dev cypress-axe axe-core`
2.  Setup in `cypress/support/e2e.js`: `import 'cypress-axe'`
3.  Nutzung in Tests: Nach jedem `cy.visit()` muss `cy.injectAxe()` aufgerufen werden. Anschließend prüft `cy.checkA11y()` die aktuelle Ansicht auf Verstöße.

#### Konkrete a11y-Testanforderungen
*   **Tastaturnavigation (Keyboard-only):**
    *   *Test:* Kann der Benutzer ohne Maus durch alle Formulare (z. B. Anlage eines Kindes oder einer Kostengutsprache) navigieren?
    *   *Fokus:* Sind alle `input`, `button` und `select`-Elemente per `Tab`-Taste erreichbar? Sind interaktive Elemente visuell als fokussiert erkennbar (Focus-Ringe)?
*   **Screenreader-Kompatibilität:**
    *   *Test (via axe):* Haben alle Formularelemente korrekte `aria-labels` oder verknüpfte `<label>`-Tags? Sind Fehlermeldungen (z. B. "AHV-Nummer ungültig") durch `aria-live` für Screenreader zugänglich?
*   **Farbkontrast & Lesbarkeit:**
    *   *Test (via axe):* Einhalten der WCAG 2.1 AA (oder AAA) Standards für Kontraste, insbesondere bei den genutzten Tailwind-Farben (z. B. dem primären `teal` oder den weichen Schatten/Border-Radiuses).

### 3.3 Konkrete E2E-Szenarien

*   **Dateneingabe mit Fallbacks:**
    *   *Test:* Formular zur Anlage eines Gesundheits-Records ausfüllen. Während des Speicherns die Netzwerkverbindung simulieren kappen (z. B. über `cy.intercept`).
    *   *Erwartet:* Der Nutzer erhält eine klare, barrierefreie Fehlermeldung und die eingegebenen Daten gehen nicht verloren.
*   **Responsive Design & Touch:**
    *   *Test:* Cypress-Tests mit simulierten Viewports (Mobile, Tablet) ausführen. Sind alle großen Buttons (Airbnb-Style) gut erreichbar und für Touch-Bedienung optimiert?
