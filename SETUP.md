# Erstmalige Einrichtung — GitHub-Repository erstellen

> **Nur einmal nötig.** Diese Schritte werden auf dem neuen Computer durchgeführt, auf den du das Projekt überträgst.

## Schritt 1 — Projektordner übertragen

Kopiere den gesamten Projektordner (`sharonmazzoletti/`) auf den neuen Computer (USB-Stick, Netzlaufwerk, etc.).

---

## Schritt 2 — Git und Node.js installieren

- **Git:** https://git-scm.com/download — Windows/Mac: Installer herunterladen und ausführen. Linux: `sudo apt install git`
- **Node.js (LTS):** https://nodejs.org — «LTS»-Version herunterladen und installieren.

---

## Schritt 3 — GitHub-Konto und SSH-Schlüssel

1. **GitHub-Konto erstellen** (falls noch keins vorhanden): https://github.com/signup

2. **SSH-Schlüssel erstellen** (Terminal öffnen):

```bash
ssh-keygen -t ed25519 -C "deine@email.com"
# Bei allen Fragen einfach Enter drücken

cat ~/.ssh/id_ed25519.pub
# Diesen Text kopieren
```

3. Auf **GitHub.com**: Profilbild oben rechts → **Settings** → **SSH and GPG keys** → **New SSH key** → Schlüssel einfügen → **Add SSH key**

4. Verbindung testen:
```bash
ssh -T git@github.com
# Erfolgsmeldung: "Hi username! You've successfully authenticated."
```

---

## Schritt 4 — Neues Repository auf GitHub erstellen

1. Auf https://github.com/new gehen.
2. **Repository name:** `sharonmazzoletti` (oder beliebig)
3. **Visibility:** Public *(GitHub Pages ist bei privaten Repos kostenpflichtig)*
4. **Kein** Readme, **kein** .gitignore, **keine** Lizenz ankreuzen — der Ordner hat bereits alles.
5. **«Create repository»** klicken.
6. Die angezeigte SSH-URL kopieren: `git@github.com:DEIN-BENUTZERNAME/sharonmazzoletti.git`

---

## Schritt 5 — Lokalen Ordner als Git-Repo initialisieren und pushen

Terminal öffnen, in den Projektordner navigieren:

```bash
cd /pfad/zu/sharonmazzoletti

git init
git add .
git commit -m "Erste Version"
git branch -M main
git remote add origin git@github.com:DEIN-BENUTZERNAME/sharonmazzoletti.git
git push -u origin main
```

---

## Schritt 6 — GitHub Pages aktivieren

1. Im Repository auf GitHub: **Settings** → **Pages** (linke Seitenleiste)
2. **Source:** «Deploy from a branch»
3. **Branch:** `main` / `/ (root)` → **Save**
4. Nach ca. 1 Minute ist die Website unter `https://DEIN-BENUTZERNAME.github.io/sharonmazzoletti` erreichbar.

### Eigene Domain (sharonmazzoletti.ch)

Die Datei `CNAME` im Projektordner enthält bereits `www.sharonmazzoletti.ch`. Damit das funktioniert, müssen beim Domain-Anbieter folgende DNS-Einträge gesetzt werden:

| Typ | Name | Wert |
|-----|------|------|
| CNAME | www | `DEIN-BENUTZERNAME.github.io` |
| A | @ | `185.199.108.153` |
| A | @ | `185.199.109.153` |
| A | @ | `185.199.110.153` |
| A | @ | `185.199.111.153` |

Dann in GitHub Pages unter **Custom domain** `www.sharonmazzoletti.ch` eintragen und **«Enforce HTTPS»** aktivieren.

---
---

# Einrichtung auf neuem Computer (nach erstem Setup)

Schritt-für-Schritt-Anleitung, um die Website auf einem weiteren Computer bearbeiten zu können.

---

## Schritt 1 — Git und Node.js installieren

- **Git:** https://git-scm.com/download — Windows/Mac: Installer herunterladen und ausführen. Linux: `sudo apt install git`
- **Node.js (LTS):** https://nodejs.org — "LTS"-Version herunterladen und installieren.

---

## Schritt 2 — Repository klonen

1. Auf **GitHub.com** das Repository öffnen.
2. Grünen **«Code»**-Button klicken → **SSH** wählen → URL kopieren (sieht aus wie `git@github.com:...`).
3. Terminal öffnen und eingeben:

```bash
git clone git@github.com:DEIN-BENUTZERNAME/sharonmazzoletti.git
cd sharonmazzoletti
```

> Falls SSH noch nicht eingerichtet ist, zuerst Schritt 3 durchführen.

---

## Schritt 3 — SSH-Schlüssel für GitHub einrichten *(einmalig pro Computer)*

```bash
# Schlüssel erstellen (bei allen Fragen einfach Enter drücken):
ssh-keygen -t ed25519 -C "deine@email.com"

# Öffentlichen Schlüssel anzeigen und kopieren:
cat ~/.ssh/id_ed25519.pub
```

Dann auf **GitHub.com**:
1. Oben rechts auf das Profilbild klicken → **Settings**
2. Links: **SSH and GPG keys** → **New SSH key**
3. Kopierten Schlüssel einfügen → **Add SSH key**

Verbindung testen:
```bash
ssh -T git@github.com
```
Erfolgsmeldung: *"Hi username! You've successfully authenticated."*

---

## Schritt 4 — Admin starten

Im Terminal im Projektordner:

```bash
./admin.sh
```

Der Browser öffnet sich automatisch auf `http://localhost:3001` (Admin) und die Live-Vorschau ist unter `http://localhost:3000` erreichbar.

---

## Tägliche Nutzung

1. Terminal öffnen, in den Projektordner navigieren, `./admin.sh` eingeben.
2. Im Admin-Interface Inhalte bearbeiten und auf **Speichern** klicken.
3. Mit **«Vorschau öffnen»** die Änderungen lokal prüfen.
4. Beschreibung eingeben, was geändert wurde (z.B. *«Neues Konzert hinzugefügt»*).
5. **«Veröffentlichen»** klicken — die Website wird innerhalb ca. 1 Minute aktualisiert.
