import requests
import json
from requests.auth import HTTPBasicAuth

url = "https://aequitas-ch.atlassian.net/rest/api/2/issue"

auth = HTTPBasicAuth("christoph.haene@gmail.com", "ATATT3xFfGF04pjE9smywh0agiMtMpyyuXMzSLRJe64BoOf6s2EaE_TH-TwgHJVyvlXcXPspVcyv4UGKyPNpx5igPqRH9KkDLki_D8vuFlDFBdxzd0ZJpRsqMfI34G2qCTt9PsHr3bXnWhaQXb6bReXv9DN8w4xRQvURE1NO2UQvZccHXpafFw8=34C63E4E")

headers = {
   "Accept": "application/json",
   "Content-Type": "application/json"
}

project_id = "10066"
epic_type_id = "10105"
story_type_id = "10108"

tickets = [
    {
        "fields": {
            "project": {"id": project_id},
            "issuetype": {"id": epic_type_id},
            "summary": "Modul Assistenz (Assistenzbeiträge)",
            "description": "Das im Whitepaper geforderte Modul zur Anstellung von Mitarbeitern, Verwaltung von Arbeitsverträgen und Durchführung der korrekten Lohnabrechnung fehlt komplett. \n\n*Akzeptanzkriterien:*\n* Mitarbeiter (z.B. IV Assistenz, Hausangestellte, Babysitter) können im System erfasst werden.\n* Mitarbeiter werden ausschliesslich im Stundenlohn angestellt (keine fixen Monatslöhne).\n* Verwaltung von Arbeitsverträgen (Erstellung, Anpassung, Beendigung).\n* Durchführung der korrekten Lohnabrechnung inkl. aller relevanten Abzüge.\n* Übersichtliche Benutzeroberfläche zur Eingabe von Stunden und Generierung von Lohnabrechnungen."
        }
    },
    {
        "fields": {
            "project": {"id": project_id},
            "issuetype": {"id": epic_type_id},
            "summary": "Empfehlungssystem (Recommender System)",
            "description": "Es gibt noch keine Logik, Datenstrukturen oder Integrationen für ein Empfehlungssystem, das Nutzern zustehende zusätzliche Leistungen vorschlägt.\n\n*Akzeptanzkriterien:*\n* Entwicklung einer regelbasierten (oder ML-basierten) Logik, die anhand von Benutzer- und Gesundheitsdaten fehlende, aber potenziell zustehende Leistungen identifiziert.\n* UI-Elemente im Dashboard, welche diese Empfehlungen proaktiv an den Nutzer kommunizieren.\n* Erklärbarkeit der Empfehlungen (warum wird diese Leistung vorgeschlagen?).\n* Möglichkeit für den Nutzer, die Empfehlung zu verfolgen (z.B. direkt einen Antragsprozess zu starten) oder zu verwerfen."
        }
    },
    {
        "fields": {
            "project": {"id": project_id},
            "issuetype": {"id": epic_type_id},
            "summary": "Internes Nachrichtensystem",
            "description": "Ein sicheres, datenschutzkonformes System zur anonymen oder direkten Kommunikation zwischen den Plattformteilnehmern (Eltern) ist noch nicht vorhanden.\n\n*Akzeptanzkriterien:*\n* Ermöglichung des sicheren Nachrichtenaustauschs zwischen Nutzern der Plattform.\n* Optionen für anonyme Kommunikation oder Kommunikation unter Pseudonym.\n* Einhaltung aller Datenschutzvorgaben (End-to-End Verschlüsselung prüfen, mindestens Transport- und Speicherebene verschlüsselt).\n* Benachrichtigungen über neue Nachrichten (In-App und Email)."
        }
    },
    {
        "fields": {
            "project": {"id": project_id},
            "issuetype": {"id": epic_type_id},
            "summary": "Terminverwaltung (Schedule-Modul)",
            "description": "Das Django-App-Modul `schedule` existiert im Code, beinhaltet aber noch keine Modelle oder Logik.\n\n*Akzeptanzkriterien:*\n* Definition und Implementierung der Datenmodelle (Termine, Erinnerungen, Wiederholungen (RRULE)).\n* Hard Limit auf die maximale Anzahl von generierten Termin-Instanzen aus RRULEs zur Verhinderung von DoS (Security).\n* API-Endpoints zur Verwaltung von Terminen (CRUD).\n* Frontend-Integration mit `react-big-calendar` und `moment`.\n* Verknüpfung von Terminen mit bestimmten Kindern oder Assistenten."
        }
    },
    {
        "fields": {
            "project": {"id": project_id},
            "issuetype": {"id": epic_type_id},
            "summary": "Dokumentenmanagement (Documents-Modul)",
            "description": "Analog zum Terminsystem existiert das Modul `documents`, es gibt jedoch noch keine Modelle für die Ablage und Digitalisierung von Briefen und Verordnungen.\n\n*Akzeptanzkriterien:*\n* Definition und Implementierung von Modellen zur sicheren Speicherung von Dokument-Metadaten.\n* Upload-Möglichkeit für verschiedene Dateitypen (PDF, Bilder) via UI und API.\n* Ablagestruktur oder Tagging-System zur Kategorisierung (z.B. Verordnungen, Briefe, Rechnungen).\n* Vorschau-Funktion (Preview) für Dokumente im Frontend.\n* Verknüpfung von Dokumenten mit anderen Entitäten (Kinder, Institutionen, Kostengutsprachen)."
        }
    },
    {
        "fields": {
            "project": {"id": project_id},
            "issuetype": {"id": story_type_id},
            "summary": "Fallvergleiche (Vergleiche mit ähnlichen Fällen)",
            "description": "Es fehlt eine Analyse- und Gruppierungslogik, um ähnliche Fälle (z.B. basierend auf der Diagnose oder abgelehnten Kostengutsprachen) anonym miteinander zu vergleichen, um daraus Argumentationen für Beschwerden abzuleiten.\n\n*Akzeptanzkriterien:*\n* Backend-Logik zur Identifikation \"ähnlicher\" Fälle (anhand von Tags, Diagnosen oder Parametern der Kostengutsprache).\n* Strikte Wahrung der Anonymität: Es dürfen keine Rückschlüsse auf die echten Benutzer möglich sein (Aggregation, Schwärzung).\n* Darstellung der Vergleichsdaten im Frontend.\n* Option zur Generierung von Argumentationshilfen basierend auf erfolgreichen, ähnlichen Einsprachen."
        }
    },
    {
        "fields": {
            "project": {"id": project_id},
            "issuetype": {"id": story_type_id},
            "summary": "Automatisierte Verlängerung auslaufender Verordnungen",
            "description": "Die Funktionalität, auslaufende Kostengutsprachen automatisch zur Verlängerung zu beantragen, ist noch nicht umgesetzt (es existiert lediglich ein `next_reminder` Feld in `CostApproval`, aber keine Automatisierung).\n\n*Akzeptanzkriterien:*\n* Job-Scheduler (z.B. via Celery/Cron), der das `next_reminder` Feld bei `CostApproval` regelmässig prüft.\n* Auslösen einer automatischen Aktion (Benachrichtigung an den Nutzer oder direkter Versand eines Antrags), wenn das Datum erreicht ist.\n* Konfigurationsmöglichkeit für den Nutzer (Opt-in/Opt-out für Automatismen)."
        }
    }
]

# Workaround for Next-Gen (Team-managed) projects issue with Epic Name if required.
# Sometimes Next-Gen doesn't need "Epic Name" custom field, but uses just Summary. Let's try standard format first.

for t in tickets:
    payload = json.dumps(t)
    response = requests.post(url, data=payload, headers=headers, auth=auth)
    print(f"Creating: {t['fields']['summary']} -> Status: {response.status_code}")
    if response.status_code not in (200, 201):
        print(response.text)
