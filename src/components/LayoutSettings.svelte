<script>
  import { settings } from "../lib/photoSettings.svelte.js";

  /**
   * Selection controls for layout, background, filter, shape and camera.
   * Reads and writes directly from/to the shared settings store.
   *
   * @prop {Array<{deviceId: string, label: string}>} cameras
   * @prop {string} selectedCameraId
   * @prop {(deviceId: string) => void} onSelectCamera
   */
  let { cameras, selectedCameraId, onSelectCamera } = $props();
</script>

<div class="row">
  <select class="select" bind:value={settings.layout}>
    <option value="strip">Layout: Strip</option>
    <option value="grid">Layout: Grid</option>
    <option value="polaroid">Layout: Polaroid</option>
  </select>

  <select class="select" bind:value={settings.bg}>
    <option value="paper">BG: Paper</option>
    <option value="solid">BG: Solid</option>
    <option value="gradient">BG: Gradient</option>
    <option value="pattern">BG: Pattern</option>
  </select>
</div>

<div class="row">
  <select class="select" bind:value={settings.filter}>
    <option value="none">Filter: Normal</option>
    <option value="bw">Filter: B&W</option>
    <option value="vintage">Filter: Vintage</option>
    <option value="warm">Filter: Warm</option>
    <option value="contrast">Filter: Contrast</option>
  </select>

  <select class="select" bind:value={settings.shape}>
    <option value="rounded">Shape: Rounded</option>
    <option value="rect">Shape: Rect</option>
    <option value="circle">Shape: Circle</option>
    <option value="heart">Shape: Heart</option>
    <option value="triangle">Shape: Triangle</option>
    <option value="hex">Shape: Hex</option>
    <option value="ticket">Shape: Ticket</option>
    <option value="mix">Shape: Mix</option>
  </select>
</div>

<div class="row">
  <select
    class="select"
    value={selectedCameraId}
    onchange={(e) => onSelectCamera(e.currentTarget.value)}
  >
    {#each cameras as cam (cam.deviceId)}
      <option value={cam.deviceId}>{cam.label}</option>
    {/each}
  </select>
</div>

<style>
  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .select {
    padding: 24px 12px;
  }

  .option {
    color: red;
  }
</style>
