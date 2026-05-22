# Aequitas

*Read this in [English](README.md).*

Aequitas ist ein geplantes soziales Netzwerk und eine digitale Plattform für Eltern von behinderten Kindern.

Das Hauptziel von Aequitas ist es, die enorme administrative Belastung für Eltern von Kindern mit Behinderungen zu reduzieren. Durch die Digitalisierung und Automatisierung von Formularen, Anträgen (z.B. Hilflosenentschädigung, Assistenzbeiträge) und der Kommunikation mit Behörden (wie der IV) möchte Aequitas den Eltern wertvolle Zeit zurückgeben.

Zusätzlich bietet die Plattform durch intelligente Fallvergleiche und ein Recommender System Unterstützung dabei, zustehende Leistungen zu identifizieren und Behördenentscheide besser einzuordnen.

Weitere, detaillierte Informationen zu den Problemen, Lösungen und administrativen Prozessen findest du im [deutschen Whitepaper](WHITEPAPER.de.md).

## Deployment

Aequitas verwendet GitHub Actions für das kontinuierliche Deployment auf Google Cloud Run. Der Workflow konfiguriert zwei Umgebungen:

1. **Test-Umgebung (`test`)**: Wird automatisch deployt, wenn ein Pull Request geöffnet wird oder ein Push auf den `main` Branch erfolgt.
2. **Produktions-Umgebung (`production`)**: Wird nur bei Pushes auf den `main` Branch deployt, nachdem das Test-Deployment erfolgreich war.

### Setup GitHub Secrets & Environments

Damit das Deployment funktioniert, müssen die folgenden Einstellungen in den GitHub Repository Settings konfiguriert werden:

1. **Secrets (`Settings` -> `Secrets and variables` -> `Actions`)**:
   - `GCP_CREDENTIALS`: Der JSON-Schlüssel eines Google Cloud Service Accounts mit Berechtigungen für Push in die Container Registry (GCR) und Deploy auf Cloud Run.

2. **Environments (`Settings` -> `Environments`)**:
   - Erstelle ein Environment mit dem Namen `production`.
   - Aktiviere "Required reviewers" und wähle die Benutzer/Teams aus, die Produktions-Deployments genehmigen müssen.

Informationen zur lokalen Bereitstellung der Applikation (speziell für QNAP Container Station) findest du in unserem englischen **[QNAP Deployment Guide](DEPLOYMENT_QNAP.md)**.
