# Aequitas: Umsetzungsstand gemäss Whitepaper

Dieses Dokument gleicht die im [Whitepaper (DE)](WHITEPAPER.de.md) formulierte Vision mit dem aktuellen Stand der Codebasis (Backend/Frontend) ab.

## 1. Bereits umgesetzt / In Umsetzung

Folgende Konzepte und Module sind in der aktuellen Architektur bereits angelegt oder teilweise umgesetzt:

*   **Grundstruktur der Module:** Die Plattform ist als Monorepo mit Django-Backend und React-Frontend aufgebaut. Die Aufteilung in fachliche Domänen (Apps) ist erkennbar.
*   **Benutzer- und Profilverwaltung (Core-Modul):** Die grundlegende Verwaltung von Benutzern (`User`), Profilen (`Profile`) und abhängigen Personen (`Dependent`, z.B. behinderte Kinder) mit Validierung der AHV-Nummer ist umgesetzt.
*   **Gesundheitsdaten (Health-Modul):** Die Erfassung von Gesundheitsmetriken (`HealthMetric`) und entsprechenden Einträgen (`HealthRecord`) ist im Backend vorbereitet.
*   **Abrechnungen und Kostengutsprachen (Settlement-Modul):**
    *   Verwaltung von Institutionen und Versicherungen.
    *   Die Verwaltung von Kostengutsprachen (`CostApproval`) mit Status (`CostApprovalStatus`) und Logs (`CostApprovalLog`) ist implementiert.
    *   *Hinweis zu Hilflosenentschädigung und Transportabrechnungen:* Das bestehende `settlement`-Modul wird aktuell als ausreichende Basis für diese Prozesse angesehen.
    *   *Hinweis zu Beschwerden, Wiedererwägungen und Rekurse:* Diese Prozesse werden momentan durch die Status-Felder (`abgelehnt`, `in_revision`, `vor_gericht`) in `CostApprovalStatus` initial abgebildet.

## 2. Noch nicht umgesetzt / Offen

Die folgenden Anforderungen aus dem Whitepaper fehlen aktuell in der Codebasis oder sind noch komplett leer:

*   **Modul Assistenz (Assistenzbeiträge):** Das im Whitepaper geforderte Modul zur Anstellung von Mitarbeitern, Verwaltung von Arbeitsverträgen und Durchführung der korrekten Lohnabrechnung fehlt komplett.
*   **Empfehlungssystem (Recommender System):** Es gibt noch keine Logik, Datenstrukturen oder Integrationen für ein Empfehlungssystem, das Nutzern zustehende zusätzliche Leistungen vorschlägt.
*   **Fallvergleiche ("Vergleiche mit ähnlichen Fällen"):** Es fehlt eine Analyse- und Gruppierungslogik, um ähnliche Fälle (z.B. basierend auf der Diagnose oder abgelehnten Kostengutsprachen) anonym miteinander zu vergleichen, um daraus Argumentationen für Beschwerden abzuleiten.
*   **Internes Nachrichtensystem:** Ein sicheres, datenschutzkonformes System zur anonymen oder direkten Kommunikation zwischen den Plattformteilnehmern (Eltern) ist noch nicht vorhanden.
*   **Terminverwaltung (Schedule-Modul):** Das Django-App-Modul `schedule` existiert im Code, beinhaltet aber noch keine Modelle oder Logik.
*   **Dokumentenmanagement (Documents-Modul):** Analog zum Terminsystem existiert das Modul `documents`, es gibt jedoch noch keine Modelle für die Ablage und Digitalisierung von Briefen und Verordnungen.
*   **Automatisierte Verlängerung auslaufender Verordnungen:** Die Funktionalität, auslaufende Kostengutsprachen automatisch zur Verlängerung zu beantragen, ist noch nicht umgesetzt (es existiert lediglich ein `next_reminder` Feld in `CostApproval`, aber keine Automatisierung).
