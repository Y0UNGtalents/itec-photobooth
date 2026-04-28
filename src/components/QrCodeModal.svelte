<script>
  import QRCode from 'qrcode';

  let { url, onClose } = $props();

  let canvasRef = $state(null);

  $effect(() => {
    if (canvasRef && url) {
      QRCode.toCanvas(canvasRef, url, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f1117',
          light: '#ffffff',
        },
      });
    }
  });
</script>

<div class="overlay" role="dialog" aria-modal="true">
  <div class="modal">
    <h2 class="heading">Foto gespeichert</h2>
    <p class="hint">QR-Code scannen zum Herunterladen</p>

    <div class="qr-wrap">
      <canvas bind:this={canvasRef}></canvas>
    </div>

    <a class="url-link" href={url} target="_blank" rel="noopener noreferrer">
      {url}
    </a>

    <button class="close-btn" onclick={onClose}>Schliessen</button>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: var(--color-surface);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
    max-width: 320px;
    width: 90vw;
  }

  .heading {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  .hint {
    font-size: 13px;
    color: var(--color-text-muted);
    margin: 0;
    text-align: center;
  }

  .qr-wrap {
    background: #fff;
    border-radius: 10px;
    padding: 10px;
    line-height: 0;
  }

  .url-link {
    font-size: 10px;
    color: var(--color-text-muted);
    word-break: break-all;
    text-align: center;
    opacity: 0.6;
    text-decoration: none;
  }

  .url-link:hover {
    opacity: 1;
    text-decoration: underline;
  }

  .close-btn {
    margin-top: 4px;
    padding: 10px 28px;
    border-radius: 10px;
    border: none;
    background: var(--color-accent, #3d8ef0);
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
  }

  .close-btn:hover {
    filter: brightness(1.15);
  }
</style>
