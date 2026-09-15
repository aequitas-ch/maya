# MAYA-5: Assistenz Modul

**Ziel:** Es soll über Maya möglich sein, Assistenz oder anderes Personal anzustellen. Dabei soll unterschieden werden können zwischen:
- IV Assistenz (IV kompatibel)
- Hausangestellt (nicht IV kompatibel, aber mit Vertrag)
- Babysitter (ohne Lohnausweis)

Das Modul soll den kompletten Lifecycle abdecken: Einstellung, Vertrag, monatliche Lohnabrechnung, quartalsweise IV Abrechnung, Lohnausweis Ende Jahr und Entlassung. Zusätzlich sollen Nebenkosten verwaltet und eine Übersicht über Angestellte sowie deren Kosten angezeigt werden.

## Erstellte User Stories

### MAYA-6: Verwaltung von Angestellten-Stammdaten (Einstellung & Entlassung)
**Beschreibung:**
Als Nutzer möchte ich die Stammdaten meiner Angestellten (Assistenten, Hausangestellte, Babysitter) in einer übersichtlichen Liste verwalten können, um jederzeit einen Überblick über mein Personal und deren Status (aktiv/entlassen) zu haben.

**Akzeptanzkriterien:**
* Eine Übersichtsseite für "Angestellte" existiert, die alle aktiven und ehemaligen Angestellten auflistet.
* Ein Formular zur Neuerfassung ("Einstellung") eines Angestellten ist vorhanden, in dem persönliche Daten (AHV-Nr, Adresse, etc.) sowie der Anstellungstyp (IV Assistenz, Hausangestellt, Babysitter) festgelegt werden können.
* Das System ermöglicht die Dokumentation einer "Entlassung" (Hinterlegung eines Austrittsdatums), wodurch der Status des Angestellten auf "inaktiv" gesetzt wird.
* (Optional) Integration oder Upload-Möglichkeit von Dokumenten (z.B. Stelleninserate für die Personalsuche).

---

### MAYA-7: Vertragsmanagement und Musterverträge
**Beschreibung:**
Als Nutzer möchte ich für meine Angestellten Arbeitsverträge basierend auf Vorlagen (z.B. Musterarbeitsvertrag LU/OW/NW) generieren oder hochladen können, um die rechtlichen Rahmenbedingungen der Anstellung formal korrekt abzuwickeln.

**Akzeptanzkriterien:**
* Dem Profil eines Angestellten können Vertragsdaten (Stundenlohn/Monatslohn, Arbeitspensum, Probezeit) hinterlegt werden.
* Das System kann aus den Stammdaten und den hinterlegten Vertragsdaten einen PDF-Arbeitsvertrag (basierend auf der hinterlegten Vorlage) generieren.
* Es können manuelle Anpassungen vor dem Export vorgenommen oder externe, unterzeichnete Verträge als PDF an das Mitarbeiterprofil angehängt werden.
* Verträge werden je nach Anstellungstyp (z.B. IV-konform vs. reiner Hausangestelltenvertrag) differenziert behandelt.

---

### MAYA-8: Monatliche Lohnabrechnung und Stundenerfassung
**Beschreibung:**
Als Nutzer möchte ich monatlich die geleisteten Arbeitsstunden, Spesen und Zulagen meiner Angestellten erfassen können, damit das System automatisch eine korrekte Lohnabrechnung (inkl. Sozialabzügen) berechnet, vergleichbar mit den bereitgestellten Excel-Vorlagen.

**Akzeptanzkriterien:**
* Eine monatliche Eingabemaske erlaubt die Erfassung von Basis-Stunden, Überstunden, Nachtpauschalen, Spesen und Ferien für jeden aktiven Angestellten.
* Das System berechnet automatisch Bruttolohn, Sozialabzüge (AHV/IV/EO, ALV, Pensionskasse, Quellensteuer) und Nettolohn basierend auf den kantonalen und vertraglichen Vorgaben.
* Eine monatliche Lohnabrechnung (Pay Slip) kann als PDF für den Arbeitnehmer generiert und exportiert werden.
* Nebenkosten (wie Versicherungsprämien des Arbeitgebers) werden mitkalkuliert und in der Kostenübersicht des Arbeitgebers transparent ausgewiesen.

---

### MAYA-9: Quartalsweise IV Abrechnung
**Beschreibung:**
Als Nutzer mit dem Anstellungstyp "IV Assistenz" möchte ich am Ende jedes Quartals eine aggregierte IV-Abrechnung generieren können, um die angefallenen Kosten gesammelt bei der Invalidenversicherung (IV) rückzufordern.

**Akzeptanzkriterien:**
* Eine Export-/Report-Funktion ermöglicht das Generieren einer quartalsweisen Zusammenfassung der relevanten Lohnkosten für IV-konforme Angestellte.
* Der Report entspricht den formalen Anforderungen der IV (Auflistung von Stunden, Basislohn und IV-erstattungsfähigen Sozialleistungen).
* Nur Daten von Angestellten mit dem Typ "IV Assistenz" fliessen in diesen spezifischen Report ein.

---

### MAYA-10: Jährlicher Lohnausweis
**Beschreibung:**
Als Nutzer möchte ich am Ende des Jahres (oder bei Austritt) automatisch den offiziellen Lohnausweis für meine Angestellten generieren lassen, damit diese ihn für ihre Steuererklärung verwenden können.

**Akzeptanzkriterien:**
* Das System aggregiert alle monatlichen Lohnläufe eines Kalenderjahres pro Angestellten.
* Für die Typen "IV Assistenz" und "Hausangestellt" wird ein Formular/PDF erzeugt, das dem offiziellen Schweizer Lohnausweis entspricht (Total Bruttolohn, Abzüge, Netto, Spesen etc.).
* Für "Babysitter" (sofern als 'ohne Lohnausweis' definiert) wird kein Lohnausweis generiert.
* Der Lohnausweis kann auch bei unterjährigen Eintritten/Austritten pro rata generiert werden.

---

### MAYA-11: Dashboard und Kostenübersicht
**Beschreibung:**
Als Nutzer möchte ich ein Dashboard haben, das mir auf einen Blick die aggregierten monatlichen und jährlichen Kosten meiner gesamten Angestellten anzeigt, um mein Budget zu kontrollieren.

**Akzeptanzkriterien:**
* Eine Reporting-Ansicht summiert alle Personalkosten (Nettolöhne, abgeführte Sozialleistungen und definierte Nebenkosten).
* Die Kosten können nach Zeitraum (Monat, Quartal, Jahr) und nach Anstellungstyp gefiltert werden.
* Graphische Darstellung der Kostenentwicklung (z.B. mittels Recharts in der Frontend-Applikation).
