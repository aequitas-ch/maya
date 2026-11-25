# MAYA-5: Modul Assistenz (Assistenzbeiträge & Personalverwaltung)

**Ziel:** Es soll über Maya möglich sein, Assistenz oder anderes Personal anzustellen. Dabei soll unterschieden werden können zwischen:
- **IV Assistenz (`IV_ASSISTANCE`):** IV-kompatibel nach IVG Art. 42quater, quartalsweiser IV-Abrechnungsreport.
- **Hausangestellt (`DOMESTIC`):** Normaler Schweizer Arbeitsvertrag (NAV/OR), AHV/ALV/BVG-pflichtig mit Jahreslohnausweis.
- **Babysitter (`BABYSITTER`):** Gelegentliche Betreuung im reinen Stundenlohn ohne formellen Lohnausweis.

Das Modul deckt den kompletten Lebenszyklus ab: Einstellung & Stammdaten, Arbeitsvertrag (PDF), monatliche Stundenerfassung & Schweizer Lohnabrechnung (Payroll Engine & Payslip-PDF), quartalsweise IV-Abrechnung, jährlicher Lohnausweis und Austritt/Entlassung.

* **Confluence-Dokumentation:** [Modul Assistenz (Wiki)](https://aequitas-ch.atlassian.net/wiki/spaces/Maya/pages/6225921/Modul+Assistenz)
* **Ticket-Anhänge / Schweizer Standardvorlagen:**
  - `MusterarbeitsvertragLUOWNW.docx` (Vorlage rechtssicherer Arbeitsvertrag LU/OW/NW)
  - `Berechnungsvorlage_Lohn Luzern_2022.xlsx` (Referenzmodell für Schweizer Sozialabzüge und AG-Nebenkosten)
  - `Vorlage Lohnabrechnung Fassis_aktualisiert_200120.xlsx` (Layout monatlicher Lohnabrechnungsbeleg / Payslip)
  - `220927_Stelleninserate und Jobbörse f. Assistenz.docx` (Leitfaden für Personalsuche & Inserate)

---

## Spezifizierte User Stories für Jules

### MAYA-8: Assistants: Angestellten-Stammdaten, Lifecycle & Austrittsverwaltung implementieren
**User Story:**
Als Arbeitgeber (Elternteil) möchte ich die Stammdaten meiner Angestellten (IV-Assistenten, Hausangestellte, Babysitter) mit Schweizer AHV-Nummer, Kontaktdaten, Bankverbindung (IBAN) und Eintritts-/Austrittsdaten verwalten und Kündigungen erfassen können, damit mein Personalstamm rechtlich und administrativ vollständig gepflegt ist.

**Technischer Kontext:**
* Backend: `backend/assistants/models.py`, `serializers.py`, `views.py`, `admin.py`, `management/commands/seed_assistants.py`
* Frontend: `frontend/src/types/assistant.ts`, `src/api/assistant.ts`, `src/pages/Assistants/EmployeeList.tsx`, `EmployeeForm.tsx`, `EmployeeDetail.tsx`

**Aufgaben & Implementierungsschritte:**
1. `Employee`-Modell erweitern: `email`, `phone`, `birth_date`, `iban`, `entry_date`, `exit_date`, `termination_reason`.
2. Validierung: AHV-Format `756.xxxx.xxxx.xx` und Datumslogik (`exit_date >= entry_date`).
3. ViewSet `EmployeeViewSet`: Custom-Action `@action(detail=True, methods=['post']) terminate(...)` für ordentliche Entlassungen.
4. Management Command `python manage.py seed_assistants` für Testdaten (IV-Assistent, Hausangestellte, Babysitter).
5. Frontend UI: Erweiterte Felder in `EmployeeForm.tsx`, Kündigungs-Modal in `EmployeeDetail.tsx`, Filter in `EmployeeList.tsx`.

---

### MAYA-9: Assistants: Vertragsmanagement & Standard-Mustervertrag (PDF) implementieren
**User Story:**
Als Arbeitgeber möchte ich für meine Angestellten Arbeitsverträge im reinen Stundenlohn erfassen und basierend auf den Schweizer Normalarbeitsverträgen (Vorlage Musterarbeitsvertrag LU/OW/NW) rechtssichere Vertragsdokumente als PDF generieren oder unterzeichnete Verträge hochladen können.

**Technischer Kontext:**
* Backend: `backend/assistants/models.py`, `serializers.py`, `views.py`, `services/contract_pdf.py`
* Frontend: `frontend/src/types/assistant.ts`, `frontend/src/pages/Assistants/EmployeeDetail.tsx`
* Vorlage: `MusterarbeitsvertragLUOWNW.docx`

**Aufgaben & Implementierungsschritte:**
1. `Contract`-Modell erweitern: `vacation_days_per_year` (Default 25), `notice_period_months` (Default 1), `contract_document` (FileField), `is_signed` (BooleanField).
2. Service `services/contract_pdf.py`: Generiert Schweizer Arbeitsvertrags-PDF mit Arbeitgeber, Arbeitnehmer, Stundenlohn, Probezeit, Ferien und Unterschriftenfeldern.
3. Endpunkte in `ContractViewSet`: `GET /contracts/{id}/download_pdf/` und `POST /contracts/{id}/upload_signed_contract/`.
4. Frontend UI in `EmployeeDetail.tsx`: Button zum PDF-Download und Upload für unterzeichnete Verträge.

---

### MAYA-10: Assistants: Monatliche Stundenerfassung & Schweizer Lohnabrechnung (Payroll Engine & Payslip-PDF)
**User Story:**
Als Arbeitgeber möchte ich monatlich geleistete Arbeitsstunden (Basis-, Überzeit-, Krankheits- und Ferienstunden) sowie Spesen erfassen und automatisch eine gesetzeskonforme Schweizer Lohnabrechnung (inkl. AHV/IV/EO, ALV, UVG, FAK und AG-Nebenkosten) als PDF-Payslip generieren lassen, basierend auf den kantonalen Berechnungsvorlagen.

**Technischer Kontext:**
* Backend: `backend/assistants/models.py`, `views.py`, `services/payroll.py`, `services/payslip_pdf.py`
* Frontend: `frontend/src/pages/Assistants/WorkingHoursForm.tsx`, `EmployeeDetail.tsx`
* Vorlagen: `Berechnungsvorlage_Lohn Luzern_2022.xlsx`, `Vorlage Lohnabrechnung Fassis_aktualisiert_200120.xlsx`

**Aufgaben & Implementierungsschritte:**
1. Schweizer Payroll-Engine (`services/payroll.py`):
   * Bruttolohn = Stunden * Stundenlohn. Spesen werden beitragsfrei addiert.
   * AN-Abzüge: AHV/IV/EO 5.30%, ALV 1.10%, BVG/Quellensteuer falls zutreffend.
   * AG-Nebenkosten: AHV 5.30%, ALV 1.10%, FAK 1.20%, UVG 1.00%, Verwaltungskosten 1.50% der AHV.
   * Nettolohn & 5-Rappen-Rundung.
2. `Payslip`-Modell erweitern: `fak_deduction`, `uvg_deduction`, `status` (`DRAFT`, `CONFIRMED`, `PAID`), `payment_date`.
3. PDF-Generator (`services/payslip_pdf.py`): Schweizer Abrechnungsbeleg mit Stundenauflistung, Abzugsposten, AG-Nebenkosten und IBAN.
4. Endpunkte: `POST /working-hours/{id}/generate_payslip/`, `GET /payslips/{id}/download_pdf/`.
5. Frontend UI: Live-Vorschau in `WorkingHoursForm.tsx`, Abrechnungshistorie mit PDF-Download in `EmployeeDetail.tsx`.

---

### MAYA-11: Assistants: Quartalsweise IV-Abrechnung & Erstattungs-Export implementieren
**User Story:**
Als Arbeitgeber von IV-Assistenten möchte ich am Ende jedes Quartals eine aggregierte IV-Abrechnung mit Stunden, Bruttolöhnen und beitragsfähigen Arbeitgeber-Nebenkosten generieren und exportieren können, um die Kosten gesammelt bei der Invalidenversicherung (IV) rückzufordern.

**Technischer Kontext:**
* Backend: `backend/assistants/views.py` (`DashboardViewSet`), `services/iv_report_pdf.py`
* Frontend: `frontend/src/pages/Assistants/AssistantDashboard.tsx`, `frontend/src/api/assistant.ts`

**Aufgaben & Implementierungsschritte:**
1. Aggregation in `DashboardViewSet.iv_report`:
   * Filtert strikt `type='IV_ASSISTANCE'`.
   * Quartale Q1-Q4 nach Monaten aggregieren: Stunden, Bruttolohn, erstattungsfähige AG-Beiträge, Gesamtforderung.
   * Verknüpfung mit betreutem Kind (`Dependent`).
2. PDF/CSV-Export (`services/iv_report_pdf.py`):
   * Endpunkt `GET /dashboard/export_iv_report_pdf/?year={year}&quarter={q}`.
   * Formulargemässer Ausdruck für die IV-Stelle mit Unterschriftsfeld.
3. Frontend UI in `AssistantDashboard.tsx`:
   * Quartalsfilter (Q1-Q4 + Jahr), Kennzahlenkarte und PDF-Download.

---

### MAYA-12: Assistants: Jährlicher Schweizer Lohnausweis (Jahresaggregation & PDF-Export)
**User Story:**
Als Arbeitgeber möchte ich per Ende Jahr (oder bei unterjährigem Austritt) für meine Angestellten automatisch den offiziellen Schweizer Lohnausweis für die kantonale Steuererklärung generieren, wobei Babysitter ohne Lohnausweispflicht ausgeschlossen werden.

**Technischer Kontext:**
* Backend: `backend/assistants/views.py` (`EmployeeViewSet`), `services/annual_statement_pdf.py`
* Frontend: `frontend/src/pages/Assistants/EmployeeDetail.tsx`

**Aufgaben & Implementierungsschritte:**
1. Validierung: Bei `type='BABYSITTER'` Rückgabe von HTTP 400 ("Keine Lohnausweispflicht").
2. Jahresaggregation der bestätigten Payslips:
   * Ziffer 1: Bruttolohnsumme (ohne Spesen)
   * Ziffer 9: Beiträge AHV/IV/EO/ALV
   * Ziffer 11: Nettolohn
   * Ziffer 13: Spesenvergütungen
   * Anstellungsdauer (pro rata bei unterjährigem Ein-/Austritt).
3. PDF-Generator (`services/annual_statement_pdf.py`): ESTV-konformer Schweizer Lohnausweis.
4. Endpunkt: `GET /employees/{id}/download_annual_statement_pdf/?year={year}`.
5. Frontend UI in `EmployeeDetail.tsx`: Jahresauswahl, Babysitter-Hinweis, Button "Lohnausweis (PDF) erstellen & herunterladen".

---

### MAYA-13: Assistants: Dashboard & Kostenübersicht (KPIs, Recharts & Treuhand-Export)
**User Story:**
Als Arbeitgeber möchte ich im Dashboard auf einen Blick die laufenden Monats- und Jahreskosten sehen, die Kostenverteilung nach Anstellungstyp visualisieren und mein Personalbudget kontrollieren können, um volle finanzielle Transparenz zu haben.

**Technischer Kontext:**
* Backend: `backend/assistants/views.py` (`DashboardViewSet`)
* Frontend: `frontend/src/pages/Assistants/AssistantDashboard.tsx`, `frontend/src/api/assistant.ts`

**Aufgaben & Implementierungsschritte:**
1. Backend-Erweiterung `DashboardViewSet`:
   * Parameter `year` (Default: aktuelles Jahr).
   * Monats-Totale 1-12: Bruttolohn, AG-Nebenkosten, Gesamtkosten, geleistete Stunden.
   * Aufteilung nach Typ (`IV_ASSISTANCE`, `DOMESTIC`, `BABYSITTER`) in CHF und Prozent.
   * Jahres-KPIs: Gesamtkosten YTD, aktive Angestellte, Durchschnittsstundenlohn.
   * Endpunkt `GET /dashboard/export_csv/?year={year}` für Buchhaltung/Treuhand.
2. Frontend UI (`AssistantDashboard.tsx`):
   * Jahresauswahl-Dropdown.
   * KPI-Statistikkarten.
   * Recharts BarChart (Monatsentwicklung Brutto vs. AG-Kosten) & PieChart (Kosten nach Typ).
   * Button "Jahresübersicht exportieren (CSV)".

---

### MAYA-54: QA Modul Assistants: Unit-, API- und GUI-Testsuiten implementieren
*(Verknüpft mit Epic MAYA-48)*
* Abdeckung aller Testfälle TC-AST-* gemäss [Teststrategie & Test Cases](https://aequitas-ch.atlassian.net/wiki/spaces/Maya/pages/14221322/Teststrategie+Test+Cases#4.3-Modul-Assistants-(MAYA-5)).
* Django Unit Tests (`backend/assistants/tests.py`).
* Bruno API Tests (`tests/api/Aequitas/Assistants/`).
* Cypress E2E Workflow Test (`tests/e2e/cypress/e2e/Assistants/01_assistants_workflow.cy.ts`).
