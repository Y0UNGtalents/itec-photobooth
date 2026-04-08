<script>
  import LayoutSettings from "./LayoutSettings.svelte";
  import SliderSettings from "./SliderSettings.svelte";
  import CaptionBar from "./CaptionBar.svelte";

  /**
   * Composes all control sections into a single panel.
   *
   * @prop {Array<{deviceId: string, label: string}>} cameras
   * @prop {string} selectedCameraId
   * @prop {(deviceId: string) => void} onSelectCamera
   */
  let { cameras, selectedCameraId, onSelectCamera } = $props();
</script>

<div class="controls">
  <LayoutSettings {cameras} {selectedCameraId} {onSelectCamera} />
  <SliderSettings />
  <div class="caption-wrap">
    <CaptionBar />
  </div>
</div>

<style>
  .controls {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 24px;
    padding-top: 10px;
    min-height: 0;
  }

  .caption-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
</style>


