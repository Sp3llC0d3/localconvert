<script lang="ts">
  import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
  import { TableIcon } from 'lucide-svelte';
  import { convertXlsxToPdf } from '$lib/pdf/from-xlsx';
  import { downloadBlob, validateFileSize } from '$lib/pdf/utils';

  // ─── State ──────────────────────────────────────────────────────────────────
  let file        = $state<File | null>(null);
  let isDragging  = $state(false);
  let status      = $state<'idle' | 'converting' | 'done' | 'error'>('idle');
  let progress    = $state(0);
  let error       = $state('');
  let resultBlob  = $state<Blob | null>(null);
  let resultName  = $state('');
  let orientation = $state<'landscape' | 'portrait'>('landscape');

  let inputRef = $state<HTMLInputElement | null>(null);

  // ─── File handling ───────────────────────────────────────────────────────────
  function acceptFile(f: File) {
    if (!f.name.match(/\.(xlsx|xls|ods|csv)$/i)) {
      error = 'Please select an Excel (XLSX/XLS), ODS, or CSV file.';
      status = 'error';
      return;
    }
    const sizeCheck = validateFileSize(f);
    if (!sizeCheck.ok) { error = sizeCheck.warning || 'File too large.'; status = 'error'; return; }

    file   = f;
    status = 'idle';
    error  = '';
    resultBlob = null;
  }

  function onFileInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    if (input.files?.[0]) acceptFile(input.files[0]);
    input.value = '';
  }

  function onDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation();
    isDragging = false;
    const f = e.dataTransfer?.files[0];
    if (f) acceptFile(f);
  }

  function onDragOver(e: DragEvent)  { e.preventDefault(); e.stopPropagation(); isDragging = true; }
  function onDragLeave(e: DragEvent) { e.preventDefault(); e.stopPropagation(); isDragging = false; }

  // ─── Conversion ──────────────────────────────────────────────────────────────
  async function convert() {
    if (!file) return;
    status = 'converting'; error = ''; progress = 0;

    try {
      const bytes = await convertXlsxToPdf(file, {
        orientation,
        onProgress: (p) => { progress = Math.round(p * 100); },
      });

      resultBlob = new Blob([bytes], { type: 'application/pdf' });
      resultName = file.name.replace(/\.(xlsx|xls|ods|csv)$/i, '.pdf');
      status     = 'done';
    } catch (e) {
      error  = e instanceof Error ? e.message : 'Conversion failed.';
      status = 'error';
    }
  }

  function download() { if (resultBlob) downloadBlob(resultBlob, resultName); }

  function reset() {
    file = null; status = 'idle'; error = '';
    resultBlob = null; resultName = ''; progress = 0;
  }
</script>

<ToolPageHeader
  category="pdf"
  icon={TableIcon}
  title="Excel to PDF"
  description="Convert XLSX, XLS, ODS, and CSV spreadsheets to PDF — locally in your browser."
  backHref="/pdf-tools/"
  backLabel="PDF Tools"
/>

<div class="tool-page-content">

  <!-- Drop zone -->
  {#if status === 'idle' || status === 'error'}
    <div
      role="button"
      tabindex="0"
      aria-label="Upload spreadsheet file"
      class="drop-zone"
      class:drag-over={isDragging}
      class:has-file={!!file}
      ondrop={onDrop}
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      onclick={() => inputRef?.click()}
      onkeydown={(e) => e.key === 'Enter' && inputRef?.click()}
    >
      {#if file}
        <div class="file-info">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
          <p class="file-name">{file.name}</p>
          <p class="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      {:else}
        <div class="drop-hint">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p>Drop your spreadsheet here</p>
          <span>XLSX · XLS · ODS · CSV — or click to browse</span>
        </div>
      {/if}
    </div>

    <input
      bind:this={inputRef}
      type="file"
      accept=".xlsx,.xls,.ods,.csv"
      class="sr-only"
      onchange={onFileInput}
    />

    {#if error}
      <p class="error-msg">{error}</p>
    {/if}

    {#if file}
      <!-- Options -->
      <div class="options-row">
        <label class="option-label">Page orientation</label>
        <div class="toggle-group">
          <button
            class="toggle-btn"
            class:active={orientation === 'landscape'}
            onclick={() => orientation = 'landscape'}
          >
            Landscape
          </button>
          <button
            class="toggle-btn"
            class:active={orientation === 'portrait'}
            onclick={() => orientation = 'portrait'}
          >
            Portrait
          </button>
        </div>
      </div>

      <div class="action-row">
        <button class="btn-secondary" onclick={reset}>Clear</button>
        <button class="btn-primary" onclick={convert}>
          Convert to PDF
        </button>
      </div>

      <p class="disclaimer">
        ⓘ Column widths are auto-calculated. Wide sheets work best in landscape mode.
        Text may be truncated if cells contain very long values.
      </p>
    {/if}
  {/if}

  <!-- Converting -->
  {#if status === 'converting'}
    <div class="progress-state">
      <p class="progress-label">Converting… {progress}%</p>
      <div class="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>
      <p class="progress-hint">Processing spreadsheet locally — nothing is uploaded.</p>
    </div>
  {/if}

  <!-- Done -->
  {#if status === 'done'}
    <div class="done-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-green-500)" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <p class="done-title">Conversion complete</p>
      <p class="done-name">{resultName}</p>
      <div class="action-row">
        <button class="btn-secondary" onclick={reset}>Convert another</button>
        <button class="btn-primary" onclick={download}>Save PDF</button>
      </div>
    </div>
  {/if}

</div>

<style lang="scss">
  .tool-page-content {
    max-width: 580px; margin: 0 auto;
    padding: 1.5rem 1rem 3rem;
    display: flex; flex-direction: column; gap: 1rem;
  }

  .drop-zone {
    border: 2px dashed var(--color-border, #d1d5db);
    border-radius: 12px; padding: 2.5rem 1.5rem;
    text-align: center; cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    &:hover, &:focus-visible { border-color: var(--color-accent, #3b82f6); }
    &.drag-over { border-color: var(--color-accent, #3b82f6); background: var(--color-accent-5, #eff6ff); }
    &.has-file  { border-style: solid; border-color: var(--color-accent, #3b82f6); }
  }

  .drop-hint p    { font-size: 1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
  .drop-hint span { font-size: 0.85rem; color: var(--color-text-muted, #6b7280); }

  .file-info { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
  .file-name { font-weight: 600; word-break: break-all; margin: 0.25rem 0 0; }
  .file-size { font-size: 0.85rem; color: var(--color-text-muted, #6b7280); margin: 0; }

  .options-row {
    display: flex; align-items: center; gap: 0.75rem;
    flex-wrap: wrap;
  }
  .option-label { font-size: 0.875rem; font-weight: 600; }

  .toggle-group { display: flex; border-radius: 8px; overflow: hidden; border: 1px solid var(--color-border, #d1d5db); }
  .toggle-btn {
    padding: 0.35rem 0.9rem; font-size: 0.85rem; font-weight: 500;
    cursor: pointer; border: none; background: transparent;
    color: var(--color-text-muted, #6b7280);
    transition: background 0.15s, color 0.15s;
    &.active { background: var(--color-accent, #3b82f6); color: #fff; }
  }

  .action-row { display: flex; gap: 0.75rem; justify-content: flex-end; }

  .btn-primary, .btn-secondary {
    padding: 0.55rem 1.25rem; border-radius: 8px;
    font-size: 0.9rem; font-weight: 600; cursor: pointer; border: none;
    transition: opacity 0.15s; &:hover { opacity: 0.85; }
  }
  .btn-primary   { background: var(--color-accent, #3b82f6); color: #fff; }
  .btn-secondary { background: var(--color-surface-2, #f3f4f6); color: var(--color-text, #111); }

  .error-msg  { color: var(--color-red-500, #ef4444); font-size: 0.875rem; margin: 0; }
  .disclaimer { font-size: 0.8rem; color: var(--color-text-muted, #6b7280); margin: 0; line-height: 1.5; }

  .progress-state {
    padding: 2rem 1rem; text-align: center;
    display: flex; flex-direction: column; gap: 0.75rem; align-items: center;
  }
  .progress-label { font-weight: 600; margin: 0; }
  .progress-hint  { font-size: 0.85rem; color: var(--color-text-muted, #6b7280); margin: 0; }
  .progress-track {
    width: 100%; height: 8px;
    background: var(--color-surface-2, #f3f4f6); border-radius: 4px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; background: var(--color-accent, #3b82f6);
    border-radius: 4px; transition: width 0.2s;
  }

  .done-state {
    padding: 2rem 1rem; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  }
  .done-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
  .done-name  { font-size: 0.875rem; color: var(--color-text-muted, #6b7280); margin: 0; word-break: break-all; }

  .sr-only {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;
  }
</style>
