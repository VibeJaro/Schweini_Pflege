# Schweini_Pflege

Kleine Browser-App (ohne Build-Tooling): Schweinchen waschen, spülen, föhnen und danach ankleiden.

## Neuerung: SVG-Kleiderschrank

- Alle Kleidungsstücke sind jetzt als SVG-Elemente hinterlegt (statt Emoji-Zeichen).
- Die Kleidung wird auf einem eigenen SVG-Layer gerendert.
- Kleidungsstücke hängen an den entsprechenden Schwein-Gruppen (Kopf, Körper, Beine) und bewegen sich dadurch synchron mit den Animationen des Schweins.

## Struktur

- `index.html` – Markup, Schwein-SVG und Outfit-SVG-Layer
- `styles_main.css` – UI- und Animations-Styles inkl. Dress-up Tray/Icons
- `game.js` – Spiel-Loop, Input, Partikel, Dress-up-Logik und SVG-Outfit-Rendering
- `audio.js` – AudioManager für One-Shots + kontinuierliche Werkzeug-Sounds

## Start

Datei direkt im Browser öffnen oder lokal per Static Server starten.
