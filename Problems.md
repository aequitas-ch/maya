# Code Review & Problems Report

Dieses Dokument fasst die Ergebnisse des Code-Reviews zusammen und kategorisiert die identifizierten Probleme nach Priorität. Alle Befunde enthalten Details zum Problem, dem Speicherort und Lösungsvorschläge.

---

## 🔴 Priorität: Hoch

### 1. Fehlende Validierung der Mandantenfähigkeit (`EmployeeViewSet`)
- **Ort:** `backend/assistants/views.py` -> `ContractViewSet.perform_create`
- **Problem:** Bei der Erstellung eines Vertrags wird zwar die `employee_id` aus dem Request gelesen und geprüft (`Employee.objects.get(id=employee_id, employer=self.request.user)`), jedoch fehlt im Frontend (und potenziell Backend-Sicherheitsnetz) eine harte Absicherung für andere verschachtelte Ressourcen. Wichtiger ist, dass in `EmployeeViewSet.generate_annual_statement` zwar die `Payslip`s nach Mitarbeiter gefiltert werden, aber keine Validierung stattfindet, ob der aufrufende User wirklich der Arbeitgeber des referenzierten Mitarbeiters ist (der Endpoint ruft lediglich `self.get_object()` auf, welches die Queryset-Berechtigung nutzt, aber es ist essenziell, die Tenant-Isolation auch bei komplexen Aggregationen sicherzustellen).
- **Lösung:** Stelle sicher, dass *alle* ViewSets strikt `get_queryset` überschreiben und die Daten auf den aktuellen `request.user` einschränken (dies ist im `EmployeeViewSet` der Fall). Prüfe jedoch kritische Actions wie `generate_annual_statement` auf korrekte Isolation.

### 2. Harte Begrenzung (Limit) bei Datums-Schleifen fehlt (DoS-Gefahr)
- **Ort:** (Allgemeine Backend-Logik für RRULEs / Wiederkehrende Termine - referenziert in den Guidelines)
- **Problem:** Die Dokumentation (`SECURITY.md`, `AGENTS.md`) schreibt vor: *"When generating date instances from recurrence patterns (e.g., RRULEs) in the backend, always implement a hard limit on the maximum number of occurrences to prevent unbounded loops and potential Denial of Service (DoS) vulnerabilities."* Es muss sichergestellt werden, dass die Implementierung in `backend/schedule/` diese Regel einhält, wenn Serverseitig Instanzen erzeugt werden.
- **Lösung:** Füge beim Parsen von RRULEs und Generieren von Terminen eine harte Konstante (z.B. max 100 Instanzen oder max 2 Jahre in die Zukunft) ein.

### 3. Fehlende Pagination im Dashboard/Listen-View
- **Ort:** `backend/assistants/views.py` -> `DashboardViewSet.iv_report`, `DashboardViewSet.list`
- **Problem:** Diese Endpunkte aggregieren und retournieren Daten (`Payslip.objects.filter...`) ohne Limit oder Pagination. Bei einer großen Menge an Lohnabrechnungen über Jahre hinweg kann dies zu massiven Performance-Einbrüchen und Memory-Problemen führen.
- **Lösung:** Integriere DRF `LimitOffsetPagination` (oder eine manuelle Aggregations-Grenze) für alle Listen, die in der Applikation zurückgegeben werden.

---

## 🟡 Priorität: Mittel

### 4. Verwendung von `any` in TypeScript (Frontend)
- **Ort:** Diverse Dateien (z.B. `frontend/src/hooks/useAppointments.ts`, `frontend/src/api/assistant.ts`, `frontend/src/pages/Dependents.tsx`, `frontend/src/pages/Health/Health.tsx`).
- **Problem:** Die Code-Richtlinien (`AGENTS.md`) schreiben striktes TypeScript vor ("Avoid `any` at all costs, use `unknown` or dedicated interfaces instead"). Die intensive Nutzung von `any` in `catch (err: any)` und Daten-Rückgaben (`Promise<any>`) untergräbt die Typsicherheit von React und kann Laufzeitfehler verstecken.
- **Lösung:** Ersetze `catch (err: any)` durch `catch (err: unknown)` und führe Typüberprüfungen durch (z.B. `if (err instanceof Error)`). Definiere explizite Interfaces für API-Responses in `frontend/src/api/*.ts`.

### 5. Fehlende Barrierefreiheit (Accessibility/A11y) in Dashboard States
- **Ort:** `frontend/src/pages/Dashboard.tsx`
- **Problem:** Es fehlt eine klare semantische Überschriften-Struktur (`h1` -> `h2` -> `h3`). Die aktuelle Seite springt in der Struktur oder lässt Screen-Reader-gerechte Beschriftungen für leere Zustände ("Empty States") teilweise vermissen. Auch die Checkboxen in z.B. `Dependents.tsx` (`id="isEncrypted"`) haben ein Label, aber komplexe Formulare sollten standardisiert durch `aria-live` Fehler ankündigen.
- **Lösung:** Prüfe die UI mit `cypress-axe` und füge `aria-labels` sowie saubere `<label>`-Verknüpfungen (mit `htmlFor`) bei *allen* Eingabefeldern hinzu. Verwende `aria-live="polite"` für asynchrone Erfolgs- und Fehlermeldungen.

### 6. Fehlende Inline Logical OR Fallbacks für Funktionen mit `void`
- **Ort:** Potenzielle Fehlerquelle in Event-Handlern.
- **Problem:** Die Guidelines warnen davor, `||` Fallbacks (für Übersetzungen) direkt in Funktionen wie `alert(t('key') || 'Fallback')` zu nutzen, wenn TypeScript im `verbatimModuleSyntax` Modus ist oder React dies nicht sauber inferiert (TS1345).
- **Lösung:** Speichere die übersetzten Strings vor der Nutzung in einer Konstante: `const msg = t('key') || 'Fallback'; alert(msg);`.

---

## 🟢 Priorität: Niedrig

### 7. Hardcodierte Passwörter in Bruno-Tests / Test-Umgebungen
- **Ort:** CI/CD Workflow (`.github/workflows/deploy.yml`) und Bruno-Testkonfigurationen.
- **Problem:** Im CI/CD Skript existieren Fallbacks wie `${{ secrets.ADMIN_USER_PASSWORD_UAT || secrets.ADMIN_USER_PASSWORD }}`. Dies ist zwar korrekt implementiert, jedoch sollte sichergestellt werden, dass Entwickler nicht versehentlich Passwörter in lokalen `.env` Dateien oder `.bru` Dateien hartcodieren.
- **Lösung:** Kontrolliere alle `.bru` Dateien in `tests/api/Aequitas/`, ob dort `admin_password` oder ähnliche Secrets direkt als String anstatt als `{{admin_password}}` Variable eingetragen sind.

### 8. Import-Typen in Vite / TypeScript (TS1484)
- **Ort:** Gesamtes Frontend.
- **Problem:** Wegen `verbatimModuleSyntax` müssen Typen explizit als solche importiert werden. Zum Beispiel in `Dashboard.tsx`: `import type { Appointment } from '../types/schedule';`.
- **Lösung:** Überprüfe alle `import` Statements. Wenn nur ein Interface oder ein Type importiert wird, muss `import type { ... } from ...` verwendet werden.

### 9. Verwendung der Farbe Indigo statt Teal
- **Ort:** `frontend/src/pages/Dashboard.tsx` (Zeile 78: `bg-indigo-100 flex flex-col items-center justify-center text-indigo-700`)
- **Problem:** Die Design-Richtlinien (Airbnb-Style, Healthcare-Fokus) geben vor, dass `teal` als primäre Akzentfarbe anstelle von `indigo` verwendet werden soll.
- **Lösung:** Ersetze alle Tailwind-Klassen mit `indigo` im Code (z.B. in `Dashboard.tsx` und Checkboxen in `Dependents.tsx`) durch `teal`.

### 10. Ungeschützte Dateiuploads im Frontend
- **Ort:** `frontend/src/pages/Dashboard.tsx` (Key-Upload).
- **Problem:** Die Datei wird im Browser eingelesen (`file.text()`), ohne ihre Größe zu überprüfen. Ein Upload einer gigantischen Datei könnte den Browser zum Absturz bringen.
- **Lösung:** Füge eine Überprüfung der Dateigröße (`if (file.size > MAX_SIZE)`) vor dem Einlesen der Datei hinzu.
