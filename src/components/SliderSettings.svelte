<script>
  import { settings } from "../lib/photoSettings.svelte.js";

  /**
   * All range sliders: shots, countdown, bg intensity, gap.
   * Reads and writes directly from/to the shared settings store.
   */
</script>

<div class="row">
  <div class="pill">
    <label for="shots">Fotos</label>
    <input
      id="shots"
      type="range"
      min="2"
      max="12"
      bind:value={settings.shots}
    />
    <span class="value">{settings.shots}</span>
  </div>
  <div class="pill">
    <label for="timer">Countdown</label>
    <input
      id="timer"
      type="range"
      min="0"
      max="8"
      bind:value={settings.timer}
    />
    <span class="value">{settings.timer}</span>
  </div>
</div>

<div class="row">
  <div class="pill">
    <label for="bgIntensity">BG Stärke</label>
    <input id="bgIntensity" type="range" min="0" max="100"bind:value={settings.bgIntensity}/>
    <span class="value">{settings.bgIntensity}</span>
  </div>
  <div class="pill">
    <label for="gap">Rand/Gap</label>
    <input id="gap" type="range" min="6" max="32" bind:value={settings.gap} />
    <span class="value">{settings.gap}</span>
  </div>
</div>

<style>
  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .pill {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--color-btn-secondary);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 24px 12px;
    border-radius: 14px;
    transition: opacity 0.2s;
  }

  .pill label {
    font-size: 12px;
    color: var(--color-text-muted);
    min-width: 88px;
    white-space: nowrap;
  }

  .value {
    font-size: 12px;
    color: var(--color-text-muted);
    min-width: 26px;
    text-align: right;
  }
</style>
