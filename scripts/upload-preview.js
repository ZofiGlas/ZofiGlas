(function () {
  const input = document.getElementById('fileInput');
  const preview = document.getElementById('preview');
  const form = document.getElementById('offerForm');

  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MAX_TOTAL_SIZE = 15 * 1024 * 1024;

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function clearPreview() { preview.innerHTML = ''; }

  function showError(msg) {
    clearPreview();
    const err = document.createElement('div');
    err.className = 'file-error';
    err.textContent = msg;
    preview.appendChild(err);
  }

  function createThumb(file, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'thumb';
    wrapper.dataset.index = index;

    const img = document.createElement('img');
    img.alt = file.name;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'thumb-info';
    info.innerHTML = `<strong>${file.name}</strong><span>${formatBytes(file.size)}</span>`;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'thumb-remove';
    removeBtn.title = 'Dieses Bild entfernen';
    removeBtn.innerHTML = '✕';

    removeBtn.addEventListener('click', function () {
      removeFileAtIndex(index);
    });

    wrapper.appendChild(img);
    wrapper.appendChild(info);
    wrapper.appendChild(removeBtn);

    const reader = new FileReader();
    reader.onload = function (e) { img.src = e.target.result; };
    reader.readAsDataURL(file);

    return wrapper;
  }

  let currentFiles = [];

  function updatePreview() {
    clearPreview();
    if (currentFiles.length === 0) return;
    currentFiles.forEach((f, i) => preview.appendChild(createThumb(f, i)));
  }

  function removeFileAtIndex(index) {
    currentFiles.splice(index, 1);
    const dt = new DataTransfer();
    currentFiles.forEach(f => dt.items.add(f));
    input.files = dt.files;
    updatePreview();
  }

  function totalSize(files) { return files.reduce((sum, f) => sum + f.size, 0); }

  input.addEventListener('change', function () {
    const files = Array.from(input.files);
    if (files.length === 0) { currentFiles = []; updatePreview(); return; }
    if (files.length > MAX_FILES) { showError(`Bitte maximal ${MAX_FILES} Bilder auswählen.`); input.value = ''; currentFiles = []; return; }
    for (const f of files) {
      if (!f.type.startsWith('image/')) { showError('Nur Bilddateien sind erlaubt.'); input.value = ''; currentFiles = []; return; }
      if (f.size > MAX_FILE_SIZE) { showError(`Die Datei ${f.name} ist zu gross (${formatBytes(f.size)}). Maximal ${formatBytes(MAX_FILE_SIZE)} erlaubt.`); input.value = ''; currentFiles = []; return; }
    }
    if (totalSize(files) > MAX_TOTAL_SIZE) { showError(`Gesamtgrösse überschreitet ${formatBytes(MAX_TOTAL_SIZE)}. Bitte kleinere Dateien wählen.`); input.value = ''; currentFiles = []; return; }
    currentFiles = files.slice();
    updatePreview();
  });

  form.addEventListener('submit', function (e) {
    if (currentFiles.length > MAX_FILES) { e.preventDefault(); showError(`Bitte maximal ${MAX_FILES} Bilder anhängen.`); return; }
    if (totalSize(currentFiles) > MAX_TOTAL_SIZE) { e.preventDefault(); showError(`Gesamtgrösse überschreitet ${formatBytes(MAX_TOTAL_SIZE)}.`); return; }
  });
})();
