=============================
MAYA-35: Health AI: Endpunkt zur Dokumenten-Extraktion (extract_from_document) implementieren
=============================

## User Story

Als Benutzer möchte ich Laborblätter oder Spitalberichte (PDF/Bild) hochladen können, damit das System die enthaltenen Messwerte per KI extrahiert und mir zur schnellen Übernahme vorschlägt.

## Technischer Kontext

* **Backend-App:** backend/health/, backend/ai/

* **Betroffene Dateien:**

* backend/health/views.py

* backend/health/urls.py

* backend/health/serializers.py



## Aufgaben & Implementierungsschritte für Jules

* **Neuen API-Endpunkt anlegen:**


* POST /api/health/records/extract_from_document/

* Parameter: document (File), dependent_id (ID)


* **KI-Extraktion integrieren:**


* Nutze get_ai_provider() aus backend/ai/gateway.py.

* Definiere JSON-Schema für extrahierte Messwerte:    [{ metric_name: str, value: str, unit: str, date: str, institution: str }]

* Übergebe Dateiinhalt und Schema an extract_structured_data().

* Gebe die extrahierten Kandidaten als JSON an das Frontend zurück.


* **Bulk-Übernahme unterstützen:**


* Ermögliche Speichern der bestätigten Kandidaten via POST /api/health/records/bulk_create/ mit source='DOCUMENT'.


## Akzeptanzkriterien

* [ ] Hochgeladene PDF/Bild-Dateien werden durch den konfigurierten AI-Provider strukturiert geparst.

* [ ] Das Frontend erhält eine Liste von erkannten Messwerten zur Bestätigung.

* [ ] Bei Bestätigung werden die Werte als HealthRecord mit source='DOCUMENT' gespeichert.





=============================
MAYA-34: Health Frontend: Status-Ampel, Recharts Reference-Areas & verbesserte Erfassungsmaske
=============================

## User Story

Als Benutzer möchte ich im Frontend ein übersichtliches Diagramm mit grünem Normbereichskorridor sowie eine Status-Ampel in der Historientabelle sehen, damit ich den Gesundheitsverlauf meines Kindes auf einen Blick erfassen kann.

## Technischer Kontext

* **Frontend-App:** frontend/src/pages/Health/

* **Betroffene Dateien:**

* frontend/src/pages/Health/Health.tsx

* frontend/src/pages/Health/ReferenceBandChart.tsx (optional Auslagerung)



## Aufgaben & Implementierungsschritte für Jules

* **Erfassungsmaske optimieren:**


* Feld Institution hinzufügen (mit Datalist / Autovervollständigung aus bisherigen Einträgen).

* Anzeige von Beschreibung und info_url der ausgewählten Metrik direkt unter dem Metrik-Dropdown.


* **Recharts Liniendiagramm erweitern:**


* Integriere <ReferenceArea y1={currentRange.normal_min} y2={currentRange.normal_max} fill="#10B981" fillOpacity={0.15} /> zur Darstellung des grünen Normbereichs-Korridors im LineChart.

* Farbige Datenpunkte (Dots): Grün für Normal, Gelb für Grenzbereich, Rot für Auffällig.


* **Historientabelle aufwerten:**


* Status-Badge pro Zeile:

* Grün: 'Normal'

* Gelb: 'Grenzbereich'

* Rot: 'Abweichend'

* Anzeige der Institution und des Bemerkungstextes.

* Link zur medizinischen Fachinformation (info_url) als klickbares Icon/Link.


## Akzeptanzkriterien

* [ ] Das Recharts-Diagramm blendet bei vorhandenem Normbereich den grünen Korridor ein.

* [ ] Tabellenzeilen zeigen den Ampel-Status visuell verständlich an.

* [ ] Das Formular erlaubt die Eingabe einer optionalen Institution.

* [ ] npm run build kompiliert ohne TypeScript- oder Lint-Fehler.





=============================
MAYA-33: Health: Dynamische Alters- & Normbereichs-Berechnung (Status-Ampel) im Backend
=============================

## User Story

Als Benutzer möchte ich bei jedem Messwert sofort sehen, ob er im altersgemäßen Normalbereich des Kindes liegt, damit auffällige Werte unmittelbar erkennbar sind.

## Technischer Kontext

* **Backend-App:** backend/health/

* **Betroffene Dateien:**

* backend/health/serializers.py

* backend/health/views.py

* backend/health/services.py (neu oder in views)

* backend/health/tests.py



## Aufgaben & Implementierungsschritte für Jules

* **Logik für Altersberechnung & Referenzmatching implementieren:**


* Ermittle Alter in Monaten zum Zeitpunkt record.date basierend auf dependent.birth_date:    age_in_months = max(0, int((record.date - dependent.birth_date).days / 30.4375)) if dependent.birth_date else None

* Suche passenden MetricReferenceRange, bei dem min_age_months <= age_in_months <= (max_age_months or 99999).


* **Status-Ermittlung (Traffic Light):**


* Wenn numerischer Wert und normal_min / normal_max vorhanden:

* 'NORMAL' (Grün): normal_min <= val <= normal_max

* 'WARNING' (Gelb): Wert innerhalb von 10% Toleranz oberhalb oder unterhalb

* 'CRITICAL' (Rot): Deutliche Hypo- oder Hyper-Abweichung

* Bei fehlendem Referenzbereich: 'UNKNOWN'


* **Serializer-Erweiterung (HealthRecordSerializer):**


* Füge SerializerMethodField status (Rückgabe: 'NORMAL', 'WARNING', 'CRITICAL', 'UNKNOWN') und matched_range hinzu.


* **Tests (backend/health/tests.py):**


* Unit-Tests für Altersberechnung und Status-Klassifikation.


## Akzeptanzkriterien

* [ ] GET /api/health/records/?dependent_id={id} liefert für jeden Record das Feld status und den geltenden Normbereich mit.

* [ ] Tests in backend/health/tests.py verifizieren die Statusberechnung fehlerfrei.





=============================
MAYA-32: Health: Datenmodelle erweitern (MetricReferenceRange, Institution, Info-URL) & Standardkatalog seeden
=============================

## User Story

Als Benutzer (Elternteil) möchte ich, dass Messgrößen ausführlich beschrieben sind (inkl. Link zu Fachinfos), altersabhängige Normbereiche hinterlegt werden können und bei Messwerten die Herkunftsinstitution festgehalten wird, damit die Gesundheitshistorie präzise und verständlich dokumentiert ist.

## Technischer Kontext

* **Backend-App:** backend/health/

* **Betroffene Dateien:**

* backend/health/models.py

* backend/health/serializers.py

* backend/health/admin.py

* backend/health/migrations/

* backend/health/management/commands/seed_health_metrics.py (neu)



## Aufgaben & Implementierungsschritte für Jules

* **HealthMetric-Modell erweitern (backend/health/models.py):**


* Füge Felder hinzu:

* description = models.TextField(blank=True, null=True, help_text="Fachliche Erklärung")

* info_url = models.URLField(blank=True, null=True, help_text="Link zu Fachinformationen")


* **Neues Modell MetricReferenceRange anlegen (backend/health/models.py):**


* metric = models.ForeignKey(HealthMetric, on_delete=models.CASCADE, related_name='reference_ranges')

* min_age_months = models.IntegerField(default=0)

* max_age_months = models.IntegerField(null=True, blank=True)

* normal_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

* normal_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

* reference_text = models.CharField(max_length=255, blank=True, null=True)

* class Meta: ordering = ['min_age_months']


* **HealthRecord-Modell erweitern (backend/health/models.py):**


* institution = models.CharField(max_length=200, blank=True, null=True)

* source = models.CharField(max_length=20, choices=[('MANUAL', 'Manuell'), ('DOCUMENT', 'Dokument'), ('DEVICE', 'Gerät')], default='MANUAL')


* **Serializer anpassen (backend/health/serializers.py):**


* MetricReferenceRangeSerializer erstellen (fields: id, min_age_months, max_age_months, normal_min, normal_max, reference_text).

* HealthMetricSerializer um description, info_url und reference_ranges (nested) erweitern.

* HealthRecordSerializer um institution und source erweitern.


* **Management Command für Pädiatrie-Seeding (backend/health/management/commands/seed_health_metrics.py):**


* Erstelle ein Command, das Standardmetriken anlegt (Gewicht [kg], Körperlänge [cm], Kopfumfang [cm], Sauerstoffsättigung [%], Puls [bpm], Körpertemperatur [°C], Blutdruck [mmHg], Hämoglobin [g/dl], Leukozyten [G/l], Thrombozyten [G/l], CRP [mg/l]) inkl. initialer Normbereiche.


* **Migrationen:**


* python manage.py makemigrations health && python manage.py migrate


## Akzeptanzkriterien

* [ ] Migrationen laufen sauber durch.

* [ ] HealthMetric unterstützt description und info_url.

* [ ] MetricReferenceRange speichert altersabhängige Grenzwerte pro Metrik.

* [ ] HealthRecord speichert optionale Institution und source.

* [ ] python manage.py seed_health_metrics befüllt die Datenbank mit Standardwerten ohne Duplikate.
