<script>
  /**
   * Displays a single-line status message.
   * @prop {string} message
   */
  let { message } = $props();
</script>

<div class="status-bar">
  <span>{message}</span>
  <span></span>
</div>

<style>
  .status-bar {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 0 2px;
    font-size: 12px;
    color: var(--color-text-muted);
  }
</style>
