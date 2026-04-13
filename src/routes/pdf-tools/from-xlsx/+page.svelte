<script lang="ts">
  import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
  import { TableIcon } from 'lucide-svelte';
  import { convertXlsxToPdf } from '$lib/pdf/from-xlsx';
  import { downloadBlob, validateFileSize } from '$lib/pdf/utils';
  import { m } from '$lib/paraglide/messages';

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
      error = m['tool_pages.from_xlsx.invalid_file']();
      status = 'error';
      return;
    }
    const sizeCheck = validateFileSize(f);
    if (!sizeCheck.ok) { error = sizeCheck.warning || m['tools_common.failed'](); status = 'error'; return; }

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
      error  = e instanceof Error ? e.message : m['tools_common.failed']();
      status = 'error';
    }
  }

  function download() { if (resultBlob) downloadBlob(resultBlob, resultName); }

  function reset() {
    file = null; status = 'idle'; error = '';
    resultBlob = null; resultName = ''; progress = 0;
  }
</script>

<div class="tool-page-content">
  <ToolPageHeader
    category="pdf"
    icon={TableIcon}
    title={m['tool_pages.from_xlsx.title']()}
    description={m['tool_pages.from_xlsx.desc']()}
    backHref="/pdf-tools/"
    backLabel={m['tools_common.back_pdf']()}
  />

  <!-- Drop zone -->
  {#if status === 'idle' || status === 'error'}
    <div
      role="button"
      tabindex="0"
      aria-label={m['tool_pages.from_xlsx.aria_upload']()}
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
          <p>{m['tool_pages.from_xlsx.drop_hint']()}</p>
          <span>{m['tool_pages.from_xlsx.drop_formats']()}</span>
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
        <label class="option-label">{m['tool_pages.from_xlsx.page_orientation']()}</label>
        <div class="toggle-group">
          <button
            class="toggle-btn"
            class:active={orientation === 'landscape'}
            onclick={() => orientation = 'landscape'}
          >
            {m['tool_pages.from_xlsx.landscape']()}
          </button>
          <button
            class="toggle-btn"
            class:active={orientation === 'portrait'}
            onclick={() => orientation = 'portrait'}
          >
            {m['tool_pages.from_xlsx.portrait']()}
          </button>
        </div>
      </div>

      <div class="action-row">
        <button class="btn" onclick={reset}>{m['tools_common.clear']()}</button>
        <button class="btn highlight" onclick={convert}>
          {m['tools_common.convert_to_pdf']()}
        </button>
      </div>

      <p class="disclaimer">
        ⓘ {m['tool_pages.from_xlsx.disclaimer']()}
      </p>
    {/if}
  {/if}

  <!-- Converting -->
  {#if status === 'converting'}
    <div class="progress-state">
      <p class="progress-label">{m['tools_common.converting_progress']({ progress })}</p>
      <div class="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>
      <p class="progress-hint">{m['tool_pages.from_xlsx.progress_hint']()}</p>
    </div>
  {/if}

  <!-- Done -->
  {#if status === 'done'}
    <div class="done-state">
      <p class="done-title">{m['tools_common.conversion_complete']()}</p>
      <p class="done-name">{resultName}</p>
      <div class="action-row">
        <button class="btn" onclick={reset}>{m['tools_common.convert_another']()}</button>
        <button class="btn highlight" onclick={download}>{m['tools_common.save_pdf']()}</button>
      </div>
    </div>
  {/if}

</div>

<style>
  .tool-page-content { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
  .drop-zone {
    border: 2px dashed var(--bg-separator);
    border-radius: 1rem;
    padding: 2.5rem 1.5rem;
    text-align: center;
    cursor: pointer;
    background: var(--bg-panel);
    box-shadow: var(--shadow-panel);
    transition: border-color 0.15s, background 0.15s;
  }
  .drop-zone:hover, .drop-zone:focus-visible { border-color: var(--accent); }
  .drop-zone.drag-over { border-color: var(--accent); background: var(--bg-panel-alt); }
  .drop-zone.has-file { border-style: solid; border-color: var(--accent); }
  .drop-hint p { font-size: 1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
  .drop-hint span { font-size: 0.85rem; color: var(--fg-muted); }
  .file-info { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
  .file-name { font-weight: 600; word-break: break-all; margin: 0.25rem 0 0; }
  .file-size { font-size: 0.85rem; color: var(--fg-muted); margin: 0; }
  .options-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .option-label { font-size: 0.875rem; font-weight: 600; }
  .toggle-group { display: flex; border-radius: 0.75rem; overflow: hidden; border: 1px solid var(--bg-separator); }
  .toggle-btn {
    padding: 0.35rem 0.9rem; font-size: 0.85rem; font-weight: 500;
    cursor: pointer; border: none; background: transparent;
    color: var(--fg-muted); transition: background 0.15s, color 0.15s;
  }
  .toggle-btn.active { background: var(--accent); color: var(--fg-on-accent); }
  .action-row { display: flex; gap: 0.75rem; justify-content: flex-end; }
  .error-msg { color: var(--fg-failure); font-size: 0.875rem; margin: 0; }
  .disclaimer { font-size: 0.8rem; color: var(--fg-muted); margin: 0; line-height: 1.5; }
  .progress-state { padding: 2rem 1rem; text-align: center; display: flex; flex-direction: column; gap: 0.75rem; align-items: center; }
  .progress-label { font-weight: 600; margin: 0; }
  .progress-hint { font-size: 0.85rem; color: var(--fg-muted); margin: 0; }
  .progress-track { width: 100%; height: 6px; background: var(--bg-separator); border-radius: 9999px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 9999px; transition: width 0.2s; }
  .done-state { padding: 2rem 1rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
  .done-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
  .done-name { font-size: 0.875rem; color: var(--fg-muted); margin: 0; word-break: break-all; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
</style>
