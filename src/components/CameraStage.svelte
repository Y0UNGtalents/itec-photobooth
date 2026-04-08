<script>
  import { onMount } from "svelte";

  /**
   * Displays the live camera feed with countdown overlay, flash effect,
   * and all action buttons overlaid at the bottom.
   *
   * @prop {HTMLVideoElement | null} videoRef - Bindable ref to the video element
   * @prop {string} facing - 'user' | 'environment'
   * @prop {boolean} mirrorOn - Whether to mirror the video horizontally
   * @prop {number} countdown - Current countdown value (0 = hidden)
   * @prop {boolean} isFlashing - Whether the flash overlay is active
   * @prop {boolean} isRunning - Disables Start/Neu while a series is running
   * @prop {boolean} hasOutput - Enables Download when a result exists
   * @prop {boolean} panelOpen - Controls the settings panel toggle state
   * @prop {() => void} onStart
   * @prop {() => void} onRedo
   * @prop {() => void} onDownload
   * @prop {() => void} onTogglePanel
   */
  let {
    videoRef = $bindable(null),
    facing,
    mirrorOn,
    countdown,
    isFlashing,
    isRunning,
    hasOutput,
    panelOpen,
    onStart,
    onRedo,
    onDownload,
    onTogglePanel,
  } = $props();

  let shouldMirror = $derived(mirrorOn && facing === "user");

  let buttonRef = $state(null);
  let dimensions = $state({ width: 0, height: 0 });

  onMount(() => {
    if (buttonRef) {
      dimensions = buttonRef.getBoundingClientRect();   
    }
  });
</script>

<div class="stage">
  <video
    bind:this={videoRef}
    playsinline
    autoplay
    muted
    style:transform={shouldMirror ? "scaleX(-1)" : "none"}
  ></video>

  <div class="overlay">
    {#if countdown > 0}
      <div class="count">{countdown}</div>
    {/if}
  </div>

  <div class="actions">

    {#if panelOpen}
      <button class="action-btn settings" style="width: {dimensions.width}px; margin-left: auto;" onclick={onTogglePanel}
        >Schließen</button
      >
    {:else}
      <button class="action-btn" onclick={onDownload} disabled={!hasOutput}>
        Download
      </button>
      <button class="action-btn primary" onclick={onStart} disabled={isRunning}>
        Start
      </button>
      <button
        class="action-btn"
        onclick={onRedo}
        disabled={isRunning || !hasOutput}
      >
        Neu
      </button>
      <button class="action-btn" bind:this={buttonRef} onclick={onTogglePanel}>Einstellungen</button>
    {/if}
  </div>

  <div class="flash" class:on={isFlashing}></div>
</div>

<style>
  .stage {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    background: #000;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  video {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    display: block;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
  }

  .count {
    font-size: 92px;
    font-weight: 900;
    color: #ffd166;
    text-shadow: 0 12px 34px rgba(0, 0, 0, 0.85);
  }

  .actions {
    position: absolute;
    bottom: 16px;
    left: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    z-index: 10;
  }

  .action-btn {
    height: 42px;
    min-width: 120px;
    padding: 0 20px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 14px;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #fff;
    cursor: pointer;
    transition:
      background 0.15s,
      opacity 0.15s;
    white-space: nowrap;
  }

  .action-btn.primary {
    background: #ffd166;
    border-color: transparent;
    color: #1b1400;
  }

  .action-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.28);
  }

  .action-btn.primary:hover:not(:disabled) {
    background: #ffe099;
  }

  .action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .flash {
    position: absolute;
    inset: 0;
    background: #fff;
    opacity: 0;
    transition: opacity 0.12s ease;
    pointer-events: none;
  }

  .flash.on {
    opacity: 0.85;
  }
</style>
