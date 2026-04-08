# PHOTOBOOTH

Eine browserbasierte Fotobox-Anwendung für Veranstaltungen, gebaut mit **Svelte 5 (Runes)** und **Vite**. Keine Backend-Abhängigkeiten — läuft vollständig im Browser.

---

## Features

| Feature              | Beschreibung                                                        |
| -------------------- | ------------------------------------------------------------------- |
| **Live-Kamera**      | Zugriff auf Gerätekamera, wechselbar zwischen Front- und Rückkamera |
| **Serienfotografie** | Automatische Aufnahme von 2–12 Fotos mit konfigurierbarem Countdown |
| **3 Layouts**        | Strip (vertikal gestapelt), Grid (Raster) und Polaroid (Einzelfoto) |
| **7 Themes**         | Hearts, Autumn, Spring, Summer, Winter, Sketch, aus                 |
| **4 Hintergründe**   | Paper, Solid, Gradient, Pattern                                     |
| **5 Filter**         | Normal, B&W, Vintage, Warm, Contrast                                |
| **8 Fotoformen**     | Rounded, Rect, Circle, Heart, Triangle, Hex, Ticket, Mix            |
| **Mirror-Modus**     | Horizontale Spiegelung der Kameraansicht und des Outputs            |
| **Beschriftung**     | Optionaler Freitext und automatisches Datum                         |
| **Download**         | Exportiert das fertige Bild als JPEG                                |
| **Flipbook**         | Exportiert die Aufnahmen als loopende WebM-Videodatei               |

---

## Technologie-Stack

| Paket                                                                          | Version | Zweck                       |
| ------------------------------------------------------------------------------ | ------- | --------------------------- |
| [Svelte](https://svelte.dev)                                                   | ^5.28   | UI-Framework (Runes-Modus)  |
| [Vite](https://vite.dev)                                                       | ^6.3    | Build-Tool & Dev-Server     |
| [@sveltejs/vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte) | ^5.0    | Svelte-Integration für Vite |

Keine weiteren Laufzeit-Abhängigkeiten. Canvas-API und MediaDevices-API sind native Browser-APIs.

---

## Schnellstart

```bash
npm install
npm run dev        # Dev-Server auf http://localhost:5173
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal vorschauen
```

---

## Projektstruktur

```
itec-fotobooth/
├── index.html                        # HTML-Einstiegspunkt
├── vite.config.js                    # Vite-Konfiguration
├── package.json
└── src/
    ├── main.js                       # Svelte-Mount
    ├── app.css                       # Globale Styles & Design-Tokens
    ├── App.svelte                    # Root-Komponente (Session-State & Koordination)
    ├── components/
    │   ├── CameraStage.svelte        # Kamerabild, Countdown-Overlay, Flash-Effekt
    │   ├── ControlPanel.svelte       # Layout-Container für alle Steuerelemente
    │   ├── ActionBar.svelte          # Start / Neu / Download / Flipbook Buttons
    │   ├── LayoutSettings.svelte     # Selects: Layout, Theme, BG, Filter, Form, Mirror
    │   ├── SliderSettings.svelte     # Slider: Fotos, Countdown, Intensitäten, Gap, FPS
    │   ├── CaptionBar.svelte         # Textfeld für Beschriftung + Datum-Toggle
    │   ├── StatusBar.svelte          # Einzeilige Statusanzeige
    │   └── PhotoPreview.svelte       # Ausgabebild (derzeit nicht eingebunden)
    └── lib/
        ├── photoSettings.svelte.js   # Reaktiver Settings-Store ($state, Modulebene)
        ├── cameraService.js          # startCamera / stopCamera
        ├── photoCapture.js           # captureFrame — Einzelbild vom Video auf Canvas
        ├── canvasRenderer.js         # Alle Canvas-Zeichenfunktionen
        ├── layoutBuilder.js          # Strip / Grid / Polaroid Komposition
        └── flipbookExporter.js       # WebM-Export via MediaRecorder API
```

---

## Architektur

### Zustandsverwaltung

Die Anwendung teilt den Zustand in zwei Kategorien:

**Settings-Store** (`src/lib/photoSettings.svelte.js`)
Reaktives Svelte-5-Objekt auf Modulebene. Alle Einstellungskomponenten importieren und mutieren es direkt — kein Prop-Drilling notwendig.

```js
export const settings = $state({
  layout, theme, bg, filter, shape,
  shots, timer, bgIntensity, themeIntensity, gap, fps,
  caption, dateOn, mirrorOn
});
```

**Session-State** (`App.svelte`)
Kurzlebiger Laufzeitzustand, der nur innerhalb einer Sitzung relevant ist:

```js
let videoRef    // Referenz auf das <video>-Element
let stream      // Aktiver MediaStream
let facing      // 'user' | 'environment'
let isRunning   // Serie läuft
let countdown   // Aktueller Countdown-Wert
let isFlashing  // Flash-Overlay aktiv
let lastFrames  // Aufgenommene Frames (DataURLs)
let lastOutput  // Fertig gerendertes JPEG (DataURL)
let panelOpen   // Einstellungsfeld sichtbar
```

### Datenfluss

```
Kamera (MediaDevices API)
    │
    ▼
CameraStage         — zeigt Live-Preview, Countdown, Flash
    │  bind:videoRef
    ▼
App.svelte          — koordiniert Aufnahme, Rendering, Download
    │
    ├─ captureFrame()    →  photoCapture.js   →  Canvas DataURL
    │                                              │
    └─ buildLayout()     →  layoutBuilder.js  →  canvasRenderer.js
                                                   │
                                                   ▼
                                              Fertiges JPEG (DataURL)
                                                   │
                                              Download / Flipbook
```

### Kamera-Synchronisation

Das `<video>`-Element lebt in `CameraStage`, wird aber als `$bindable`-Prop nach `App.svelte` durchgereicht. Ein `$effect` in `App.svelte` verbindet Stream und Element sobald beide verfügbar sind:

```js
$effect(() => {
  if (videoRef && stream) videoRef.srcObject = stream;
});
```

### Panel-Animation

Das Einstellungsfeld liegt als `position: absolute` innerhalb einer `.camera-clip`-Hülle mit `overflow: hidden`. Per `translateY(100%)` verschwindet es vollständig unter dem Kamerarand; `translateY(0)` bringt es zurück. Der runde Toggle-Button liegt außerhalb der Clip-Hülle und ist immer sichtbar.

```
.stage-container  (position: relative, padding-bottom für Button)
├── .camera-clip  (overflow: hidden — clippt das Panel)
│   ├── <video>
│   └── .drawer   (position: absolute, translateY Animation)
└── .toggle-btn   (position: absolute, bottom: 0 — nie geclippt)
```

---

## Canvas-Rendering-Pipeline

Jede Aufnahme durchläuft folgende Schritte:

1. **Capture** (`photoCapture.js`)
   - Video-Frame wird auf einen temporären Canvas gezeichnet
   - Seitenverhältnis 4:3 wird durch Cropping sichergestellt
   - Filter (CSS `ctx.filter`) und Mirror-Transformation werden angewendet
   - Ausgabe: JPEG DataURL (900 × 675 px)

2. **Layout-Komposition** (`layoutBuilder.js`)
   - Lädt alle DataURLs als `Image`-Objekte (`img.decode()`)
   - Erzeugt einen Canvas in der Zielgröße
   - Ruft in dieser Reihenfolge die Renderer auf:
     1. `drawBackground` — Hintergrundfarbe / -muster
     2. `drawShot` — Jedes Foto mit Clip-Pfad (Form) und Schatten
     3. `drawThemeOverlay` — Dekorative Overlays (Herzen, Blätter, …)
     4. `drawOuterBorder` — Äußerer Rahmen
     5. `drawCaption` — Text und Datum

3. **Export**
   - `canvas.toDataURL('image/jpeg', 0.95)` — Download als JPEG
   - `canvas.captureStream()` + `MediaRecorder` — Export als WebM-Flipbook

---

## Design-Tokens (`app.css`)

Alle visuellen Grundwerte sind als CSS Custom Properties definiert:

```css
/* Farben */
--color-bg-deep          /* Hintergrund (tiefste Ebene) */
--color-bg-glow          /* Hintergrund (Radial-Glow) */
--color-surface          /* Karten-/App-Oberfläche */
--color-text             /* Primäre Textfarbe */
--color-text-muted       /* Sekundäre / gedämpfte Textfarbe */
--color-btn              /* Standard-Button-Hintergrund */
--color-btn-secondary    /* Sekundärer Button / Pill-Hintergrund */
--shadow-card            /* App-Schatten */

/* Schriftgrößen */
--fontsize-xs / sm / md / lg / xl

/* Abstände */
--spacething-xs / sm / md / kg / xl

/* Eckenradien */
--border-radius-xs / sm / md / lg / xl
```

---

## Browser-Anforderungen

| API                         | Verwendung                    |
| --------------------------- | ----------------------------- |
| `MediaDevices.getUserMedia` | Kamerazugriff                 |
| `Canvas 2D API`             | Bildkomposition und Rendering |
| `MediaRecorder API`         | WebM-Flipbook-Export          |
| `img.decode()`              | Asynchrones Laden der Frames  |

Empfohlen: aktuelle Versionen von Chrome, Edge oder Firefox. Safari unterstützt den VP9-Codec für WebM eingeschränkt (Flipbook-Export fällt automatisch auf VP8 zurück).

---

*itec – learn together grow together*
