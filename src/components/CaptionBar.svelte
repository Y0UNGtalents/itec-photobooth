<script>
  import { settings } from '../lib/photoSettings.svelte.js';

  /**
   * Caption text input.
   * Reads and writes directly from/to the shared settings store.
   */
</script>

<div class="row">
  <input
    class="input"
    type="text"
    placeholder="Optionaler Text"
    bind:value={settings.caption}
  />
</div>

<style>
  .row {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .input {
    flex: 1;
    min-height: 40px;
    padding: 24px 12px;
  }
</style>
