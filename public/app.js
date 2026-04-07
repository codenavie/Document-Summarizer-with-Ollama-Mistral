const { createApp, ref, onMounted, computed } = Vue;

createApp({
  setup() {
    const selectedFile = ref(null);
    const summary = ref('');
    const outputFilename = ref('summary.txt');
    const error = ref('');
    const successMessage = ref('');
    const loading = ref(false);
    const theme = ref('light');

    const isDark = computed(() => theme.value === 'dark');

    function applyTheme(nextTheme) {
      theme.value = nextTheme;
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
    }

    function toggleTheme() {
      applyTheme(isDark.value ? 'light' : 'dark');
    }

    function handleFileChange(event) {
      const file = event.target.files?.[0] || null;
      selectedFile.value = file;
      summary.value = '';
      error.value = '';
      successMessage.value = '';
    }

    async function summarizePdf() {
      if (!selectedFile.value) {
        error.value = 'Please select a PDF file first.';
        return;
      }

      loading.value = true;
      error.value = '';
      successMessage.value = '';
      summary.value = '';

      try {
        const formData = new FormData();
        formData.append('file', selectedFile.value);

        const response = await fetch('/summarize', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to summarize document.');
        }

        outputFilename.value = data.filename || 'summary.txt';
        summary.value = data.summary || '';
        successMessage.value = `Summary generated: ${outputFilename.value}`;
      } catch (err) {
        error.value = err.message || 'Something went wrong while summarizing.';
      } finally {
        loading.value = false;
      }
    }

    function downloadSummary() {
      if (!summary.value) return;

      const blob = new Blob([summary.value], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = outputFilename.value;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }

    onMounted(() => {
      const persistedTheme = localStorage.getItem('theme');
      if (persistedTheme === 'dark' || persistedTheme === 'light') {
        applyTheme(persistedTheme);
        return;
      }

      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    });

    return {
      selectedFile,
      summary,
      error,
      successMessage,
      loading,
      isDark,
      toggleTheme,
      handleFileChange,
      summarizePdf,
      downloadSummary,
    };
  },
}).mount('#app');
