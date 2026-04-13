<script lang="ts">
  import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
  import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
  import { FileOutputIcon } from 'lucide-svelte';
  import { convertPdfToDocx } from '$lib/pdf/to-docx';
  import { downloadBlob } from '$lib/pdf/utils';
  import { m } from '$lib/paraglide/messages';

  // ─── State ──────────────────────────────────────────────────────────────────
  let files      = $state<File[]>([]);
  let status     = $state<'idle' | 'converting' | 'done' | 'error'>('idle');
  let progress   = $state(0);
  let error      = $state('');
  let resultBlob = $state<Blob | null>(null);
  let resultName = $state('');

  let file = $derived(files[0] ?? null);

  $effect(() => {
    void files;
    status = 'idle';
    error = '';
    resultBlob = null;
  });

  // ─── Conversion ──────────────────────────────────────────────────────────────
  async function convert() {
    if (!file) return;
    status = 'converting'; error = ''; progress = 0;

    try {
      const bytes = await convertPdfToDocx(file, {
        onProgress: (p) => { progress = Math.round(p * 100); },
      });

      resultBlob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      resultName = file.name.replace(/\.pdf$/i, '.docx');
      status     = 'done';
    } catch (e) {
      error  = e instanceof Error ? e.message : m['tools_common.failed']();
      status = 'error';
    }
  }

  function download() { if (resultBlob) downloadBlob(resultBlob, resultName); }

  function reset() {
    files = []; status = 'idle'; error = '';
    resultBlob = null; resultName = ''; progress = 0;
  }
</script>

<div class="tool-page-content">
  <ToolPageHeader
    category="pdf"
    icon={FileOutputIcon}
    title={m['tool_pages.to_docx.title']()}
    description={m['tool_pages.to_docx.desc']()}
    backHref="/pdf-tools/"
    backLabel={m['tools_common.back_pdf']()}
  />

  <!-- File input -->
  {#if status === 'idle' || status === 'error'}
    <PdfUploader bind:files multiple={false} />

    {#if error}
      <p class="error-msg">{error}</p>
    {/if}

    {#if file}
      <div class="action-row">
        <button class="btn" onclick={reset}>{m['tools_common.clear']()}</button>
        <button class="btn highlight" onclick={convert}>
          {m['tool_pages.to_docx.btn']()}
        </button>
      </div>

      <div class="limitation-box">
        <p class="limitation-title">ℹ️ {m['tool_pages.to_docx.expect_title']()}</p>
        <ul>
          <li>{m['tool_pages.to_docx.expect_text']()}</li>
          <li>{m['tool_pages.to_docx.expect_headings']()}</li>
          <li>{m['tool_pages.to_docx.expect_tables']()}</li>
          <li>{m['tool_pages.to_docx.expect_scanned']()}</li>
        </ul>
      </div>
    {/if}
  {/if}

  <!-- Converting -->
  {#if status === 'converting'}
    <div class="progress-state">
      <p class="progress-label">{m['tool_pages.to_docx.progress_label']({ progress })}</p>
      <div class="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>
      <p class="progress-hint">{m['tool_pages.to_docx.progress_hint']()}</p>
    </div>
  {/if}

  <!-- Done -->
  {#if status === 'done'}
    <div class="done-state">
      <p class="done-title">{m['tools_common.conversion_complete']()}</p>
      <p class="done-name">{resultName}</p>
      <div class="action-row">
        <button class="btn" onclick={reset}>{m['tools_common.convert_another']()}</button>
        <button class="btn highlight" onclick={download}>{m['tool_pages.to_docx.save']()}</button>
      </div>
    </div>
  {/if}

</div>

<style>
  .tool-page-content { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
  .action-row { display: flex; gap: 0.75rem; justify-content: flex-end; }
  .error-msg { color: var(--fg-failure); font-size: 0.875rem; margin: 0; }
  .limitation-box {
    background: var(--bg-panel);
    border: 1px solid var(--bg-separator);
    border-radius: 1rem;
    padding: 0.9rem 1rem;
    font-size: 0.85rem;
    line-height: 1.6;
    box-shadow: var(--shadow-panel);
  }
  .limitation-title { font-weight: 700; margin: 0 0 0.4rem; }
  ul { margin: 0; padding-left: 1.2rem; }
  li { color: var(--fg-muted); }
  .progress-state { padding: 2rem 1rem; text-align: center; display: flex; flex-direction: column; gap: 0.75rem; align-items: center; }
  .progress-label { font-weight: 600; margin: 0; }
  .progress-hint { font-size: 0.85rem; color: var(--fg-muted); margin: 0; }
  .progress-track { width: 100%; height: 6px; background: var(--bg-separator); border-radius: 9999px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 9999px; transition: width 0.2s; }
  .done-state { padding: 2rem 1rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
  .done-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
  .done-name { font-size: 0.875rem; color: var(--fg-muted); margin: 0; word-break: break-all; }
</style>
