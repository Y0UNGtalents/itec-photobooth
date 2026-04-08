<script>
  import { onMount } from 'svelte';
  import { settings } from './lib/photoSettings.svelte.js';
  import { listCameras, startCameraById, stopCamera } from './lib/cameraService.js';
  import { captureFrame } from './lib/photoCapture.js';
  import { buildLayout } from './lib/layoutBuilder.js';
  import CameraStage from './components/CameraStage.svelte';
  import ControlPanel from './components/ControlPanel.svelte';

  let videoRef = $state(null);
  let stream = $state(null);
  let facing = $state('user');
  let cameras = $state([]);
  let selectedCameraId = $state('');
  let status = $state('Bereit.');
  let lastOutput = $state('');
  let isRunning = $state(false);
  let countdown = $state(0);
  let isFlashing = $state(false);

  let hasOutput = $derived(lastOutput !== '');
  let panelOpen = $state(false);

  // Sync stream to video element whenever either changes
  $effect(() => {
    if (videoRef && stream) {
      videoRef.srcObject = stream;
    }
  });

  onMount(async () => {
    await initCamera();
    return () => stopCamera(stream);
  });

  // ─── Camera ─────────────────────────────────────────────────────────────────

  async function initCamera(deviceId = selectedCameraId) {
    try {
      stopCamera(stream);
      stream = await startCameraById(deviceId || undefined);

      const track = stream.getVideoTracks()[0];
      facing = track?.getSettings().facingMode ?? 'user';
      selectedCameraId = track?.getSettings().deviceId ?? '';

      cameras = await listCameras();
      status = 'Bereit.';
    } catch {
      status = 'Kamera blockiert.';
    }
  }

  async function handleSelectCamera(deviceId) {
    status = 'Kamera wechseln…';
    await initCamera(deviceId);
  }

  // ─── Photo series ────────────────────────────────────────────────────────────

  async function handleStart() {
    panelOpen = false;
    isRunning = true;
    status = 'Serie läuft…';

    const frames = [];
    for (let i = 0; i < settings.shots; i++) {
      if (settings.timer > 0) await runCountdown(settings.timer);
      triggerFlash();
      frames.push(captureFrame(videoRef, {
        filter: settings.filter,
        mirrorOn: settings.mirrorOn,
        facing,
      }));
      await sleep(250);
    }

    lastFrames = frames;
    isRunning = false;
    status = 'Render…';

    try {
      lastOutput = await buildLayout(frames, settings);
      status = 'Fertig.';
    } catch (error) {
      console.error(error);
      status = 'Render fehlgeschlagen.';
    }
  }

  async function runCountdown(seconds) {
    for (let i = seconds; i > 0; i--) {
      countdown = i;
      await sleep(700);
    }
    countdown = 0;
  }

  function triggerFlash() {
    isFlashing = true;
    setTimeout(() => { isFlashing = false; }, 120);
  }

  // ─── Output actions ──────────────────────────────────────────────────────────

  function handleRedo() {
    lastOutput = '';
    lastFrames = [];
    status = 'Bereit.';
  }

  function handleDownload() {
    if (!lastOutput) { status = 'Kein Ergebnis.'; return; }

    const anchor = document.createElement('a');
    anchor.href = lastOutput;
    anchor.download = `fotokasten_${settings.layout}_${settings.theme}_${settings.shape}.jpg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    status = 'Download gestartet.';
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
</script>

<div class="app">
  <header class="top">
    <div>
      <div class="title">PHOTOBOOTH</div>
    </div>
  </header>

  <!-- padding-bottom leaves space for the toggle button that straddles the camera edge -->
  <div class="stage-container">
    <!-- overflow:hidden clips the panel when it slides below the camera -->
    <div class="camera-clip">
      <CameraStage
        bind:videoRef
        {facing}
        mirrorOn={settings.mirrorOn}
        {countdown}
        {isFlashing}
        {isRunning}
        {hasOutput}
        {panelOpen}
        onStart={handleStart}
        onRedo={handleRedo}
        onDownload={handleDownload}
        onTogglePanel={() => (panelOpen = !panelOpen)}
      />

      <div class="drawer" class:open={panelOpen}>
        <div class="drawer-inner">
          <ControlPanel
            {cameras}
            {selectedCameraId}
            onSelectCamera={handleSelectCamera}
          />
        </div>
      </div>
    </div>
  </div>

  <footer class="footer">
    <span class="status">{status}</span>
    <span>itec – learn together grow together</span>
  </footer>
</div>

<style>
  .app {
    width: min(95vw, 900px);
    background: var(--color-surface);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 22px;
    padding: 14px;
    box-shadow: var(--shadow-card);
    backdrop-filter: blur(8px);
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }

  .title {
    font-weight: 850;
    letter-spacing: 0.2px;
  }


  /* ── Camera + sliding panel ── */

  .stage-container {
    position: relative;
  }

  /* overflow:hidden clips the panel when translated below the camera edge */
  .camera-clip {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
  }

  /* Panel slides in/out with translateY; fills the full camera area */
  .drawer {
    position: absolute;
    inset: 0;
    transform: translateY(100%);
    transition: transform 0.40s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(11, 12, 16, 0.96);
    backdrop-filter: blur(18px);
  }

  .drawer.open {
    transform: translateY(0);
  }

  .drawer-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    /* bottom padding: 42px button + 16px gap + 16px breathing room */
    padding: 10px 14px 74px;
    overflow: hidden;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    font-size: 11px;
    color: var(--color-text-muted);
    opacity: 0.6;
  }
</style>
