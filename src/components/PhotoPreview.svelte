<script>
  /**
   * Displays the composed photo output.
   * @prop {string} src - Data URL of the rendered image
   */
  let { src } = $props();
</script>

{#if src}
  <div class="preview-container">
    <img class="preview" {src} alt="PHOTOBOOTH-Ergebnis" />
  </div>
{/if}

<style>
  .preview-container {
    margin-top: 12px;
  }

  .preview {
    width: 100%;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: block;
  }
</style>
