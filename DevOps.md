# DevOps / Maintenance Tasks

Hier sind die Befehle und Anleitungen für Dinge, die ich (der Agent) nicht direkt im Remote Repository ausführen kann, die aber von GitHub Copilot oder dir manuell übernommen werden können.

## 1. Nicht mehr benötigte Branches schliessen

Alle Branches, die nicht `main` oder `test` sind, sollen gelöscht werden, da sie gemerged sind oder nicht mehr benötigt werden.

Um die Branches im Remote-Repository (origin) zu löschen, kopiere das folgende Skript und führe es lokal in deinem Terminal aus. Es liest die Remote Branches, ignoriert `main` und `test`, und löscht die verbleibenden Branches.

```bash
# Hole die neuesten Remote-Infos und entferne gelöschte Referenzen
git fetch --prune

# Lade alle Remote-Branches, filtere 'main' und 'test' heraus, entferne Whitespaces und "origin/" Prefix
git branch -r | grep -v 'main' | grep -v 'test' | awk '{print $1}' | sed 's/origin\///' > branches_to_delete.txt

# Schau dir die Liste kurz an (optional)
cat branches_to_delete.txt

# Lösche alle in der Liste enthaltenen Branches auf dem Remote 'origin'
cat branches_to_delete.txt | xargs -I {} git push origin --delete {}

# Räume nach
rm branches_to_delete.txt
```

*(Hinweis: Lokale Branches kannst du mit `git branch -D <branch>` löschen.)*

## 2. Actions prüfen und verbessern

Die aktuelle `.github/workflows/deploy.yml` ist bereits solide aufgesetzt und führt Build, Push, Deploy, Database-Seeding sowie Tests (Cypress & Bruno) aus.

Hier sind konkrete Vorschläge zur Verbesserung, die in einem PR umgesetzt werden können:

1. **Docker Build Caching:**
   Ergänze in den `docker build` Schritten (Frontend & Backend) das Caching über GitHub Actions (z.B. `--cache-from` und `--cache-to`). Das beschleunigt wiederholte Builds extrem.
   *Beispiel:*
   ```yaml
   - name: Set up Docker Buildx
     uses: docker/setup-buildx-action@v3
   ```
   Und dann bei `docker build`:
   ```yaml
   --cache-from=type=gha
   --cache-to=type=gha,mode=max
   ```

2. **Abhängigkeiten Caching für Tests (Node.js):**
   Für den Bruno-Test-Job (und eventuell Cypress) können NPM-Pakete gecached werden:
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v5
     with:
       node-version: '24'
       cache: 'npm'
   ```

3. **Artefakte / Logs:**
   Falls Cypress- oder Bruno-Tests fehlschlagen, sollten Screenshots oder Logs als Artifacts hochgeladen werden (`actions/upload-artifact@v4`), um das Debugging zu erleichtern.

## 3. Struktur prüfen und verbessern

Die Monorepo-Struktur (`backend/`, `frontend/`, `tests/`) ist sehr aufgeräumt und sauber getrennt.
Um diese Struktur zu stützen, habe ich eine detaillierte DevOps-Dokumentation im Ordner `docs/devops/` angelegt.

- `docs/devops/ARCHITECTURE.md` (Englisch)
- `docs/devops/ARCHITECTURE.de.md` (Deutsch)

Diese Dokumente beschreiben die Architektur, den CI/CD-Prozess und die Infrastruktur auf Google Cloud Run.
