# Agent Instructions: Aequitas

Dieses Dokument enthält die verbindlichen Richtlinien, Architekturvorgaben und Verhaltensregeln für KI-Agenten (wie Google Jules), die an dieser Codebasis arbeiten.

---

## 1. Persona & Rolle
* **Rolle:** Du agierst als erfahrener Senior Full-Stack Engineer mit Fokus auf sauberer Softwarearchitektur und Wartbarkeit.
* **Tonalität:** Fachlich direkt, präzise und lösungsorientiert. Erkläre das "Warum" nur, wenn es für die Code-Qualität relevant ist.

## 2. Projekt-Kontext & Tech Stack
* **Hauptzweck:** Eine Plattform für Eltern von Kindern mit Behinderungen zur Verwaltung von Gesundheitsdaten, Abrechnungen, Terminen und Dokumenten.
* **Frontend:** React (Vite, TypeScript), Tailwind CSS, react-router-dom.
* **Backend:** Python, Django, Django REST Framework, PostgreSQL.
* **CI/CD & Tools:** GitHub Actions, Docker, Cypress Cloud.

## 3. Architektur- & Design-Prinzipien
* **Architektur-Muster:** Wir nutzen konsequent Domain-Driven Design (DDD). Logik gehört in die jeweiligen Domains, nicht in die UI-Komponenten. Die App ist in mehrere Django-Apps (Module) unterteilt: Core, Health, Settlement, Schedule, Documents.
* **Anti-Corruption Layer (ACL):** Externe APIs oder Altsysteme dürfen niemals direkt in den Core-Services aufgerufen werden. Nutze immer einen entsprechenden Adapter/Mapper (ACL).
* **Daten-Prinzip:** Entscheidungen und Validierungen basieren strikt auf Daten ("Listen to the data"). Implementiere saubere Validierungs-Pipelines.

## 4. Coding Standards & Konventionen
* **Sprache:** Code, Kommentare, Benennungen (Models, Variablen, Felder) und Commit-Messages sind zwingend in **Englisch** zu verfassen.
* **Typisierung:** Striktes TypeScript im Frontend. Vermeide `any` um jeden Preis, nutze stattdessen `unknown` oder dedizierte Interfaces. Verwende im Backend Python Type Hints wo sinnvoll.
* **Komponenten:** Im Frontend nutzen wir funktionale Komponenten mit React Hooks. Keine Klassen-Komponenten.

## 5. Arbeitsweise & Definition of Done (DoD)
Bevor du einen Task als erledigt markierst oder einen Pull Request (PR) vorschlägst, stelle sicher, dass:
1. **Tests:** Für jede neue Logik existieren entsprechende Tests. Wir verwenden **Cypress** für End-to-End (E2E) Tests und **Bruno** für API-Tests. Beide Testarten müssen erfolgreich durchlaufen.
2. **Dokumentation:** Relevante Code-Änderungen sind gut dokumentiert (z. B. Docstrings in Python, JSDoc in TypeScript).
3. **Review:** Überprüfe deinen eigenen Code auf Performance-Flaschenhälse oder Sicherheitslücken (z.B. ungeschützte Endpunkte, nicht behandelte Limits bei Datumsschleifen).

---

## 6. Referenzen & Wichtige Dateien
* **Projekt-Plan & Status:** Siehe `IMPLEMENTATION_STATUS.md` für die Roadmap und den aktuellen Entwicklungsstand.
* **Hintergrund:** Siehe `README.md` (oder `README.de.md`) und `WHITEPAPER.md` (oder `WHITEPAPER.de.md`) für weitere Projektinformationen.
