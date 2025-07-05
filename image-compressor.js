document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    const uploadContainer = document.getElementById('upload-container');
    const workspace = document.getElementById('workspace');
    const imageQueueContainer = document.getElementById('imageQueueContainer');
    const imageCardTemplate = document.getElementById('imageCardTemplate');
    const historyCardTemplate = document.getElementById('historyCardTemplate');
    const comparisonSlider = document.getElementById('comparison-slider');
    const afterWrapper = comparisonSlider.querySelector('.after-wrapper');
    const sliderHandle = comparisonSlider.querySelector('.slider-handle');
    const previewBeforeImg = document.getElementById('preview-before-img');
    const previewBeforeInfo = document.getElementById('preview-before-info');
    const previewAfterImg = document.getElementById('preview-after-img');
    const previewAfterInfo = document.getElementById('preview-after-info');
    const compressionRatioSpan = document.getElementById('compression-ratio');
    const downloadButton = document.getElementById('downloadButton');
    const downloadAllButton = document.getElementById('downloadAllButton');
    const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
    const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    const deleteAllBtnDesktop = document.getElementById('delete-all-btn-desktop');
    const deleteAllBtnMobile = document.getElementById('delete-all-btn-mobile');
    const historyBtnDesktop = document.getElementById('history-btn-desktop');
    const historyBtnMobile = document.getElementById('history-btn-mobile');
    const historyModal = document.getElementById('historyModal');
    const closeHistoryModal = document.getElementById('closeHistoryModal');
    const historyList = document.getElementById('historyList');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarCloseBtnHeader = document.getElementById('sidebar-close-btn-header');
    const sidebarCloseBtnFooter = document.getElementById('sidebar-close-btn-footer');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalText = document.getElementById('confirmModalText');
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const formatSelect = document.getElementById('format-select');
    const removeExifCheckbox = document.getElementById('remove-exif');
    const qualityPresetButtons = document.getElementById('quality-preset-buttons');
    const resizeModeSelect = document.getElementById('resize-mode');
    const dimensionsWrapper = document.getElementById('dimensions-wrapper');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const aspectRatioLock = document.getElementById('aspect-ratio-lock');
    const resizeValueWrapper = document.getElementById('resize-value-wrapper');
    const resizeValueInput = document.getElementById('resize-value');
    const fileSizeWrapper = document.getElementById('file-size-wrapper');
    const fileSizeInput = document.getElementById('file-size-input');
    const fileSizeUnitSelect = document.getElementById('file-size-unit-select');
    const imageTitleInput = document.getElementById('image-title-input');
    const qualityFieldset = document.getElementById('quality-fieldset');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const resetSliderBtn = document.getElementById('resetSliderBtn');
    const colorPaletteContainer = document.getElementById('color-palette-container');
    const colorPaletteDiv = document.getElementById('color-palette');
    const eyedropperBtn = document.getElementById('eyedropper-btn');
    const eyedropperDisplay = document.getElementById('eyedropper-display');
    const eyedropperLoupe = document.getElementById('eyedropper-loupe');
    const loupeCanvas = document.getElementById('loupe-canvas');
    const loupeCtx = loupeCanvas.getContext('2d');
    const watermarkType = document.getElementById('watermark-type');
    const watermarkTextControls = document.getElementById('watermark-text-controls');
    const watermarkImageControls = document.getElementById('watermark-image-controls');
    const watermarkCommonControls = document.getElementById('watermark-common-controls');
    const watermarkText = document.getElementById('watermark-text');
    const watermarkFontColor = document.getElementById('watermark-font-color');
    const watermarkFontSize = document.getElementById('watermark-font-size');
    const watermarkImageUpload = document.getElementById('watermark-image-upload');
    const watermarkOpacity = document.getElementById('watermark-opacity');
    const watermarkOpacityValue = document.getElementById('watermark-opacity-value');
    const watermarkPosition = document.getElementById('watermark-position');

    let imageStates = [];
    let currentSelectedId = null;
    let debounceTimer;
    let confirmCallback = null;
    let isEyedropperActive = false;
    let isDraggingWatermark = false;
    let watermarkDragOffset = { x: 0, y: 0 };
    const colorThief = new ColorThief();
    const defaultPrimaryColor = '#618164';
    const defaultHoverColor = '#4F6F52';

    const sunIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg><span>Light Mode</span>`;
    const moonIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg><span>Dark Mode</span>`;

    const HistoryManager = {
        key: 'imageCompressorHistory',
        get: function() { return JSON.parse(localStorage.getItem(this.key) || '[]'); },
        save: function(history) { localStorage.setItem(this.key, JSON.stringify(history)); },
        add: function(state) {
            if (!state.compressedBlob || !state.originalSrc) return;
            const reader = new FileReader();
            reader.onloadend = () => {
                const history = this.get();
                const historyItem = {
                    id: Date.now(),
                    title: state.settings.imageTitle + '.' + state.settings.format.split('/')[1],
                    size: formatBytes(state.compressedBlob.size),
                    compressedDataUrl: reader.result,
                    originalDataUrl: state.originalSrc,
                    timestamp: new Date().toLocaleString()
                };
                history.unshift(historyItem);
                this.save(history.slice(0, 50));
            };
            reader.readAsDataURL(state.compressedBlob);
        },
        remove: function(id) {
            let history = this.get();
            history = history.filter(item => item.id !== id);
            this.save(history);
            this.render();
        },
        clearAll: function() {
            this.save([]);
            this.render();
        },
        render: function() {
            const history = this.get();
            historyList.innerHTML = '';
            if (history.length === 0) {
                historyList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Your download history is empty.</p>';
                return;
            }
            history.forEach(item => {
                const cardFragment = historyCardTemplate.content.cloneNode(true);
                const card = cardFragment.querySelector('.history-card');
                
                card.querySelector('img').src = item.compressedDataUrl;
                card.querySelector('.history-title').textContent = item.title;
                card.querySelector('.history-size').textContent = item.size;
                card.querySelector('.history-date').textContent = item.timestamp;
                
                card.addEventListener('click', e => {
                    if (e.target.closest('button')) return;
                    const file = this.dataURLtoFile(item.originalDataUrl, item.title);
                    handleFiles([file]);
                    historyModal.style.display = 'none';
                });

                card.querySelector('.history-download-btn').addEventListener('click', (e) => {
                     e.stopPropagation();
                     downloadFileFromDataURL(item.compressedDataUrl, item.title);
                });

                card.querySelector('.history-delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    showConfirmDialog('Delete History Item?', `Are you sure you want to delete "${item.title}"?`, () => this.remove(item.id));
                });

                historyList.appendChild(cardFragment);
            });
        },
        dataURLtoFile: function(dataurl, filename) {
            const arr = dataurl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while(n--) { u8arr[n] = bstr.charCodeAt(n); }
            const blob = new Blob([u8arr], {type: mime});
            return new File([blob], filename, { type: mime, lastModified: Date.now() });
        },
        init: function() {
            const openHistory = () => {
                this.render();
                historyModal.style.display = 'block';
                document.body.classList.remove('sidebar-open');
            };
            historyBtnDesktop.addEventListener('click', openHistory);
            historyBtnMobile.addEventListener('click', openHistory);
            closeHistoryModal.addEventListener('click', () => historyModal.style.display = 'none');
            
            document.getElementById('deleteAllHistoryBtn').addEventListener('click', () => {
                showConfirmDialog(
                    'Delete All History?',
                    'This will permanently erase your entire download history. This action cannot be undone.',
                    () => this.clearAll()
                );
            });
            
            window.addEventListener('click', (e) => {
                if(e.target == historyModal) historyModal.style.display = 'none';
            });
        }
    };
    
    function createInitialState(file) {
        return {
            id: Date.now() + Math.random(), file, cardElement: null, originalSrc: null, compressedBlob: null,
            compressedSrc: null, width: 0, height: 0,
            settings: {
                format: 'image/jpeg', resizeMode: 'dimensions', quality: 75, targetWidth: 0, targetHeight: 0,
                resizeValue: 100, targetSizeValue: 1, targetSizeUnit: 'MB', removeExif: true,
                imageTitle: file.name.split('.').slice(0, -1).join('.'),
                watermark: { 
                    type: 'none', text: 'Your Brand', fontSize: 48, fontColor: '#ffffff', 
                    imageSrc: null, opacity: 0.7, position: 'center', x: 0.5, y: 0.5, lastRect: null 
                }
            }
        };
    }

    function initApp() {
        initTheme();
        HistoryManager.init();
        initEventListeners();
        initInitialPreview();
        initSlider();
        initKeyboardShortcuts();
    }

    function initEventListeners() {
        imageInput.addEventListener('change', (e) => handleFiles(e.target.files));
        uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
        uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
        document.addEventListener('paste', handlePaste);
        
        downloadButton.addEventListener('click', downloadCurrentImage);
        downloadAllButton.addEventListener('click', downloadAllFiles);

        const deleteAllAction = () => showConfirmDialog('Delete All Images?', 'This will clear the entire queue.', resetUI);
        deleteAllBtnDesktop.addEventListener('click', deleteAllAction);
        deleteAllBtnMobile.addEventListener('click', deleteAllAction);
        uploadAnotherBtn.addEventListener('click', deleteAllAction);

        themeToggleDesktop.addEventListener('click', toggleTheme);
        themeToggleMobile.addEventListener('click', toggleTheme);
        
        function closeSidebar() { document.body.classList.remove('sidebar-open'); }
        hamburgerBtn.addEventListener('click', () => document.body.classList.toggle('sidebar-open'));
        sidebarOverlay.addEventListener('click', closeSidebar);
        sidebarCloseBtnHeader.addEventListener('click', closeSidebar);
        sidebarCloseBtnFooter.addEventListener('click', closeSidebar);

        const inputs = [formatSelect, resizeModeSelect, qualitySlider, fileSizeInput, fileSizeUnitSelect, resizeValueInput, widthInput, heightInput, aspectRatioLock, imageTitleInput, removeExifCheckbox, watermarkType, watermarkText, watermarkFontColor, watermarkFontSize, watermarkOpacity, watermarkPosition];
        inputs.forEach(el => el.addEventListener('input', handleSettingChange));

        qualityPresetButtons.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                qualitySlider.value = e.target.dataset.quality;
                qualitySlider.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        watermarkImageUpload.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    const state = imageStates.find(s => s.id === currentSelectedId);
                    if(state) {
                        state.settings.watermark.imageSrc = re.target.result;
                        handleSettingChange();
                    }
                }
                reader.readAsDataURL(e.target.files[0]);
            }
        });

        resetSliderBtn.addEventListener('click', () => {
            if (currentSelectedId && !qualitySlider.disabled) {
                qualitySlider.value = 75;
                qualitySlider.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        
        eyedropperBtn.addEventListener('click', toggleEyedropper);

        confirmOkBtn.addEventListener('click', () => {
            if (typeof confirmCallback === 'function') confirmCallback();
            hideConfirmDialog();
        });
        confirmCancelBtn.addEventListener('click', hideConfirmDialog);
        window.addEventListener('click', (e) => {
            if (e.target == confirmModal) hideConfirmDialog();
        });

        comparisonSlider.addEventListener('mousedown', handleWatermarkDragStart);
        document.addEventListener('mousemove', handleWatermarkDragMove);
        document.addEventListener('mouseup', handleWatermarkDragEnd);
        comparisonSlider.addEventListener('touchstart', handleWatermarkDragStart, { passive: false });
        document.addEventListener('touchmove', handleWatermarkDragMove, { passive: false });
        document.addEventListener('touchend', handleWatermarkDragEnd);
    }

    async function handleFiles(files) {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;
        
        uploadContainer.style.display = 'none';
        if(imageStates.length > 0) resetUI(false);
        else resetUI(false);

        workspace.style.display = 'grid';
        uploadAnotherBtn.style.display = 'block';
        setTimeout(() => workspace.classList.add('is-visible'), 10);

        for (const file of imageFiles) {
            const state = createInitialState(file);
            const cardClone = imageCardTemplate.content.cloneNode(true);
            const cardElement = cardClone.querySelector('.image-card');
            cardElement.dataset.id = state.id;
            state.cardElement = cardElement;
            
            cardElement.querySelector('.delete-card-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                showConfirmDialog('Delete Image?', 'Are you sure you want to remove this image?', () => removeImage(state.id));
            });
            
            cardElement.addEventListener('click', () => selectImage(state.id));
            imageQueueContainer.appendChild(cardClone);
            imageStates.push(state);
            await processNewImage(state);
        }
        if (imageStates.length > 0) {
            selectImage(imageStates[0].id);
        }
    }

    function handlePaste(e) {
        const items = e.clipboardData?.items;
        if (!items) return;
        const files = Array.from(items).filter(item => item.type.indexOf('image') !== -1).map(item => {
            const file = item.getAsFile();
            file.name = `pasted-image-${Date.now()}.${file.type.split('/')[1]}`;
            return file;
        });
        if(files.length > 0) handleFiles(files);
    }

    function processNewImage(state) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => {
                state.originalSrc = e.target.result;
                state.cardElement.querySelector('.image-preview').src = state.originalSrc;
                const img = new Image();
                img.onload = () => {
                    state.width = img.naturalWidth;
                    state.height = img.naturalHeight;
                    state.settings.targetWidth = state.width;
                    state.settings.targetHeight = state.height;
                    compressSingleImage(state).then(resolve);
                };
                img.src = state.originalSrc;
            };
            reader.readAsDataURL(state.file);
        });
    }
    
    function removeImage(id) {
        const index = imageStates.findIndex(s => s.id === id);
        if (index === -1) return;

        const stateToRemove = imageStates[index];
        if (stateToRemove.originalSrc) URL.revokeObjectURL(stateToRemove.originalSrc);
        if (stateToRemove.compressedSrc) URL.revokeObjectURL(stateToRemove.compressedSrc);
        stateToRemove.cardElement.remove();
        imageStates.splice(index, 1);
        
        if (id === currentSelectedId) {
            currentSelectedId = null;
            if (imageStates.length > 0) {
                const newIndex = Math.max(0, index - 1);
                selectImage(imageStates[newIndex].id);
            } else {
                resetUI();
            }
        }
    }

    function selectImage(id) {
        if (currentSelectedId === id) return;
        currentSelectedId = id;
        const state = imageStates.find(s => s.id === id);
        if (!state) return;
        imageStates.forEach(s => s.cardElement.classList.toggle('selected', s.id === id));
        previewBeforeImg.src = state.originalSrc;
        previewBeforeInfo.innerHTML = `<b>Original:</b> ${state.width}x${state.height} - ${formatBytes(state.file.size)}`;
        if (state.compressedSrc) {
            updateAfterPreview(state);
        } else {
            previewAfterImg.src = "";
            previewAfterInfo.textContent = "Processing...";
            compressionRatioSpan.style.display = 'none';
        }
        updateSettingsPanel(state);
        generateColorPalette(previewBeforeImg);
    }
    
    function updateAfterPreview(state) {
        previewAfterImg.src = state.compressedSrc;
        const tempImg = new Image();
        tempImg.onload = () => {
             const reduction = 1 - (state.compressedBlob.size / state.file.size);
             compressionRatioSpan.textContent = `${(reduction * 100).toFixed(0)}% saved`;
             compressionRatioSpan.style.display = reduction >= 0 ? 'inline-block' : 'none';
             previewAfterInfo.innerHTML = `<b>Compressed:</b> ${tempImg.naturalWidth}x${tempImg.naturalHeight} - ${formatBytes(state.compressedBlob.size)}`;
        }
        tempImg.src = state.compressedSrc;
    }

    function updateSettingsPanel(state) {
        const { settings } = state;
        formatSelect.value = settings.format;
        removeExifCheckbox.checked = settings.removeExif;
        resizeModeSelect.value = settings.resizeMode;
        dimensionsWrapper.style.display = settings.resizeMode === 'dimensions' ? 'block' : 'none';
        resizeValueWrapper.style.display = settings.resizeMode === 'percentage' ? 'block' : 'none';
        fileSizeWrapper.style.display = settings.resizeMode === 'fileSize' ? 'block' : 'none';
        widthInput.value = Math.round(settings.targetWidth);
        heightInput.value = Math.round(settings.targetHeight);
        resizeValueInput.value = settings.resizeValue;
        fileSizeInput.value = settings.targetSizeValue;
        fileSizeUnitSelect.value = settings.targetSizeUnit;
        imageTitleInput.value = settings.imageTitle;
        qualitySlider.value = settings.quality;
        qualityValue.textContent = settings.quality;
        qualityFieldset.style.display = settings.format !== 'image/png' ? 'block' : 'none';
        const isFileSizeMode = settings.resizeMode === 'fileSize' && settings.format !== 'image/png';
        qualitySlider.disabled = isFileSizeMode;
        resetSliderBtn.disabled = isFileSizeMode;

        watermarkType.value = settings.watermark.type;
        watermarkText.value = settings.watermark.text;
        watermarkFontColor.value = settings.watermark.fontColor;
        watermarkFontSize.value = settings.watermark.fontSize;
        watermarkOpacity.value = settings.watermark.opacity;
        watermarkOpacityValue.textContent = settings.watermark.opacity;
        watermarkPosition.value = settings.watermark.position;
        watermarkTextControls.style.display = settings.watermark.type === 'text' ? 'block' : 'none';
        watermarkImageControls.style.display = settings.watermark.type === 'image' ? 'block' : 'none';
        watermarkCommonControls.style.display = settings.watermark.type !== 'none' ? 'block' : 'none';

        document.querySelectorAll('#quality-preset-buttons button').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.quality) === state.settings.quality);
        });
    }

    function handleSettingChange(e) {
        if (!currentSelectedId) return;
        const state = imageStates.find(s => s.id === currentSelectedId);
        if (!state) return;
        const { settings } = state;
        
        settings.format = formatSelect.value;
        settings.removeExif = removeExifCheckbox.checked;
        settings.resizeMode = resizeModeSelect.value;
        settings.quality = parseInt(qualitySlider.value);
        settings.resizeValue = parseInt(resizeValueInput.value) || 1;
        settings.targetSizeValue = parseFloat(fileSizeInput.value) || 1;
        settings.targetSizeUnit = fileSizeUnitSelect.value;
        settings.imageTitle = imageTitleInput.value;

        if (settings.resizeMode === 'dimensions') {
            const newWidth = parseInt(widthInput.value, 10);
            const newHeight = parseInt(heightInput.value, 10);
            if (aspectRatioLock.checked) {
                const ratio = state.width / state.height;
                const activeInput = e ? e.target.id : null;
                if (activeInput === 'widthInput' && newWidth) {
                     settings.targetHeight = newWidth / ratio;
                } else if (activeInput === 'heightInput' && newHeight) {
                    settings.targetWidth = newHeight * ratio;
                } else {
                    settings.targetWidth = newWidth || 0;
                    settings.targetHeight = newHeight || 0;
                }
            } else {
                settings.targetWidth = newWidth || 0;
                settings.targetHeight = newHeight || 0;
            }
        }
        
        settings.watermark.type = watermarkType.value;
        settings.watermark.text = watermarkText.value;
        settings.watermark.fontColor = watermarkFontColor.value;
        settings.watermark.fontSize = parseInt(watermarkFontSize.value) || 32;
        settings.watermark.opacity = parseFloat(watermarkOpacity.value);
        if (e && e.target.id === 'watermark-position') {
            settings.watermark.position = watermarkPosition.value;
        }

        updateSettingsPanel(state);
        clearTimeout(debounceTimer);
        previewAfterInfo.textContent = 'Processing...';
        compressionRatioSpan.style.display = 'none';
        debounceTimer = setTimeout(() => compressSingleImage(state), 300);
    }

    async function compressSingleImage(state) {
        updateProgress(state, 'Processing...', 0);
        const img = new Image();
        img.src = state.originalSrc;
        await new Promise(r => img.onload = r);
        updateProgress(state, 'Compressing...', 30);
        
        const { settings } = state;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const outputDims = calculateOutputDimensions(state, settings);
        canvas.width = Math.max(1, outputDims.width);
        canvas.height = Math.max(1, outputDims.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        await applyWatermark(ctx, canvas, settings.watermark);
        
        let finalBlob;
        if (settings.resizeMode === 'fileSize' && settings.format !== 'image/png') {
            const targetBytes = settings.targetSizeValue * (settings.targetSizeUnit === 'MB' ? 1024 * 1024 : 1024);
            let low = 1, high = 100;
            let bestBlob = null;
            for (let i = 0; i < 7; i++) {
                 const mid = Math.round((low + high) / 2);
                 if (low > high) break;
                 const blob = await new Promise(resolve => canvas.toBlob(resolve, settings.format, mid / 100));
                 if (blob.size <= targetBytes) {
                    bestBlob = blob;
                    low = mid + 1;
                 } else {
                    high = mid - 1;
                 }
            }
            finalBlob = bestBlob;
            if (state.id === currentSelectedId) {
                settings.quality = high;
                updateSettingsPanel(state);
            }
        } else {
            finalBlob = await new Promise(resolve => canvas.toBlob(resolve, settings.format, settings.quality / 100));
        }
        
        updateProgress(state, 'Finalizing...', 95);
        if (!finalBlob) {
            if (state.id === currentSelectedId) previewAfterInfo.textContent = 'Compression Failed';
            checkAllCompressed(); 
            updateProgress(state, 'Failed', 0, true);
            return;
        }
        if (state.compressedSrc) URL.revokeObjectURL(state.compressedSrc);
        state.compressedBlob = finalBlob;
        state.compressedSrc = URL.createObjectURL(finalBlob);
        
        if (state.id === currentSelectedId) updateAfterPreview(state);
        
        checkAllCompressed();
        HistoryManager.add(state);
        updateProgress(state, 'Done', 100, true);
    }

    async function applyWatermark(ctx, canvas, watermark) {
        if (watermark.type === 'none') {
            watermark.lastRect = null;
            return;
        }
        
        ctx.globalAlpha = watermark.opacity;
        let element, elementWidth, elementHeight;

        if (watermark.type === 'text') {
            ctx.fillStyle = watermark.fontColor;
            ctx.font = `${watermark.fontSize}px Inter`;
            const textMetrics = ctx.measureText(watermark.text);
            elementWidth = textMetrics.width;
            elementHeight = watermark.fontSize; 
        } else if (watermark.type === 'image' && watermark.imageSrc) {
            element = new Image();
            element.src = watermark.imageSrc;
            await new Promise(r => element.onload = r);
            elementWidth = element.width;
            elementHeight = element.height;
        } else {
            watermark.lastRect = null;
            return;
        }

        const margin = canvas.width * 0.05;
        const positions = {
            'top-left': { x: margin, y: margin },
            'top-right': { x: canvas.width - elementWidth - margin, y: margin },
            'bottom-left': { x: margin, y: canvas.height - elementHeight - margin },
            'bottom-right': { x: canvas.width - elementWidth - margin, y: canvas.height - elementHeight - margin },
            'center': { x: (canvas.width - elementWidth) / 2, y: (canvas.height - elementHeight) / 2 }
        };

        let x, y;
        if (watermark.position === 'custom') {
            x = watermark.x * canvas.width;
            y = watermark.y * canvas.height;
        } else {
            const pos = positions[watermark.position] || positions.center;
            x = pos.x;
            y = pos.y;
        }

        if (watermark.type === 'text') {
            ctx.textBaseline = 'top';
            ctx.fillText(watermark.text, x, y);
        } else if (watermark.type === 'image' && element) {
            ctx.drawImage(element, x, y);
        }
        
        watermark.lastRect = { x, y, width: elementWidth, height: elementHeight };
        ctx.globalAlpha = 1.0;
    }

    function calculateOutputDimensions(state, settings) {
        let width = state.width, height = state.height;
        if (settings.resizeMode === 'percentage') {
            const scale = (settings.resizeValue || 100) / 100;
            width = state.width * scale;
            height = state.height * scale;
        } else if (settings.resizeMode === 'dimensions') {
            width = settings.targetWidth;
            height = settings.targetHeight;
        }
        return { width: Math.round(width), height: Math.round(height) };
    }
    
    function generateColorPalette(imgElement) {
        if (!imgElement.src || !imgElement.complete) {
            colorPaletteContainer.style.display = 'none';
            resetThemeColor();
            return;
        }
        try {
            const palette = colorThief.getPalette(imgElement, 8);
            if (!palette) {
                colorPaletteContainer.style.display = 'none';
                resetThemeColor();
                return;
            }
            
            const themeColor = palette.find(rgb => (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) < 186) || palette[0];
            updateThemeColor(themeColor);
            
            colorPaletteDiv.innerHTML = '';
            palette.forEach(rgb => {
                const hex = `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`;
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = hex;
                swatch.title = `Copy ${hex}`;
                swatch.innerHTML = `<span class="hex-code">${hex}</span>`;
                swatch.addEventListener('click', () => copyToClipboard(hex, swatch.querySelector('.hex-code')));
                colorPaletteDiv.appendChild(swatch);
            });
            colorPaletteContainer.style.display = 'block';
        } catch (e) {
            colorPaletteContainer.style.display = 'none';
            resetThemeColor();
        }
    }

    function updateThemeColor(rgb) {
        document.documentElement.style.setProperty('--c-primary', `rgb(${rgb.join(',')})`);
        document.documentElement.style.setProperty('--c-primary-hover', `rgb(${rgb.map(c => Math.max(0, c - 20)).join(',')})`);
    }
    
    function resetThemeColor() {
        document.documentElement.style.setProperty('--c-primary', defaultPrimaryColor);
        document.documentElement.style.setProperty('--c-primary-hover', defaultHoverColor);
    }

    function downloadFileFromDataURL(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
    }
    
    function downloadCurrentImage() {
        const state = imageStates.find(s => s.id === currentSelectedId);
         if (state && state.compressedSrc) {
            const link = document.createElement('a');
            link.href = state.compressedSrc;
            link.download = `${state.settings.imageTitle || 'image'}.${state.settings.format.split('/')[1]}`;
            link.click();
        }
    }

    function downloadAllFiles() {
        imageStates.forEach(state => {
            if (state.compressedSrc) {
                const link = document.createElement('a');
                link.href = state.compressedSrc;
                link.download = `${state.settings.imageTitle || 'image'}.${state.settings.format.split('/')[1]}`;
                link.click();
            }
        });
    }

    function updateProgress(state, message, percentage, isDone = false) {
        if (!state || !state.cardElement) return;
        const overlay = state.cardElement.querySelector('.progress-overlay');
        const text = state.cardElement.querySelector('.progress-text');
        const bar = state.cardElement.querySelector('.progress-bar-inner');
        overlay.style.display = 'flex';
        text.textContent = message;
        bar.style.width = `${percentage}%`;
        if (isDone) setTimeout(() => { overlay.style.display = 'none'; }, 1000);
    }

    function initTheme() { 
        const savedTheme = localStorage.getItem('theme') || 'light'; 
        const isDark = savedTheme === 'dark';
        document.body.classList.toggle('dark-mode', isDark); 
        themeToggleDesktop.innerHTML = isDark ? moonIconSVG.replace(/<span>.*?<\/span>/, '') : sunIconSVG.replace(/<span>.*?<\/span>/, '');
        themeToggleMobile.innerHTML = isDark ? moonIconSVG : sunIconSVG;
    }
    function toggleTheme() { 
        const isDark = document.body.classList.toggle('dark-mode'); 
        localStorage.setItem('theme', isDark ? 'dark' : 'light'); 
        initTheme();
    }
    
    function resetUI(showUploadContainer = true) {
        if (imageStates.length > 0) {
             imageStates.forEach(state => {
                if (state.originalSrc) URL.revokeObjectURL(state.originalSrc);
                if (state.compressedSrc) URL.revokeObjectURL(state.compressedSrc);
            });
        }
        workspace.style.display = 'none';
        workspace.classList.remove('is-visible');
        if (showUploadContainer) {
            uploadContainer.style.display = 'block';
        }
        uploadArea.style.display = 'flex';
        uploadAnotherBtn.style.display = 'none';
        imageQueueContainer.innerHTML = '';
        previewBeforeImg.src = '';
        previewAfterImg.src = '';
        previewBeforeInfo.innerHTML = '<b>-</b>';
        previewAfterInfo.innerHTML = 'Waiting for settings...';
        compressionRatioSpan.style.display = 'none';
        colorPaletteContainer.style.display = 'none';
        downloadButton.disabled = true;
        downloadAllButton.disabled = true;
        imageInput.value = null;
        imageStates = [];
        currentSelectedId = null;
        afterWrapper.style.clipPath = 'inset(0 0 0 50%)';
        sliderHandle.style.left = '50%';
        resetThemeColor();
        document.body.classList.remove('sidebar-open');
        if(showUploadContainer) initInitialPreview();
    }

    function checkAllCompressed() {
        const allDone = imageStates.every(s => s.compressedBlob);
        downloadButton.disabled = !allDone;
        downloadAllButton.disabled = !allDone;
    }
    
    function formatBytes(bytes, decimals = 2) { 
        if (!+bytes) return '0 Bytes'; 
        const k = 1024; 
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; 
        const i = Math.floor(Math.log(bytes) / Math.log(k)); 
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals < 0 ? 0 : decimals))} ${sizes[i]}`; 
    }
    
    function initSlider() {
        setupSliderControls(document.getElementById('comparison-slider'));
        setupSliderControls(document.getElementById('initial-art-slider'));
    }

    function setupSliderControls(sliderElement) {
         if (!sliderElement) return;
        let isDragging = false;
        const handle = sliderElement.querySelector('.slider-handle');
        const after = sliderElement.querySelector('.after-wrapper');
        const startDragging = (e) => { e.preventDefault(); isDragging = true; };
        const stopDragging = () => { isDragging = false; };
        const onDrag = (e) => {
            if (!isDragging || isDraggingWatermark) return;
            const rect = sliderElement.getBoundingClientRect();
            const clientX = e.clientX || e.touches[0].clientX;
            let x = clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            const percent = (x / rect.width) * 100;
            handle.style.left = `${percent}%`;
            after.style.clipPath = `inset(0 0 0 ${percent}%)`;
        };
        handle.addEventListener('mousedown', startDragging);
        document.addEventListener('mouseup', stopDragging);
        document.addEventListener('mousemove', onDrag);
        handle.addEventListener('touchstart', startDragging, { passive: false });
        document.addEventListener('touchend', stopDragging);
        document.addEventListener('touchmove', onDrag, { passive: false });
    }

    async function initInitialPreview() {
        const artBeforeImg = document.getElementById('initial-before-img');
        const artAfterImg = document.getElementById('initial-after-img');
        const artBeforeInfo = document.getElementById('initial-before-info');
        const artAfterInfo = document.getElementById('initial-after-info');

        try {
            artBeforeInfo.textContent = 'Loading...';
            artBeforeInfo.style.display = 'block';
            artAfterInfo.textContent = 'Loading...';
            artAfterInfo.style.display = 'block';

            const beforeUrl = 'https://cdn.jsdelivr.net/gh/Leshoraa/Image-Compressor@main/img/image.jpeg';
            const afterUrl = 'https://cdn.jsdelivr.net/gh/Leshoraa/Image-Compressor@main/img/after.jpeg';

            artBeforeImg.src = beforeUrl;
            artAfterImg.src = afterUrl;

            const [beforeResponse, afterResponse] = await Promise.all([
                fetch(beforeUrl),
                fetch(afterUrl)
            ]);

            const beforeBlob = await beforeResponse.blob();
            const afterBlob = await afterResponse.blob();

            artBeforeInfo.textContent = `Before: ${formatBytes(beforeBlob.size)}`;
            artAfterInfo.textContent = `After: ${formatBytes(afterBlob.size)}`;

        } catch (error) {
            artBeforeInfo.textContent = 'Preview failed to load';
            artAfterInfo.style.display = 'none';
        }
    }

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (workspace.style.display === 'none' || confirmModal.style.display === 'block') return;
            const activeEl = document.activeElement;
            if (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT' || activeEl.tagName === 'TEXTAREA') return;
            
            const currentIndex = imageStates.findIndex(s => s.id === currentSelectedId);
            if (e.key === 'ArrowRight') {
                if (currentIndex < imageStates.length - 1) selectImage(imageStates[currentIndex + 1].id);
            } else if (e.key === 'ArrowLeft') {
                if (currentIndex > 0) selectImage(imageStates[currentIndex - 1].id);
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                if (currentSelectedId !== null) {
                    showConfirmDialog('Delete Image?', 'Are you sure you want to remove this image?', () => removeImage(currentSelectedId));
                }
            } else if (e.key.toLowerCase() === 'e') {
                e.preventDefault();
                toggleEyedropper();
            }
        });
    }

    function showConfirmDialog(title, text, callback) {
        confirmModalTitle.textContent = title;
        confirmModalText.textContent = text;
        confirmCallback = callback;
        confirmModal.style.display = 'block';
    }

    function hideConfirmDialog() {
        confirmModal.style.display = 'none';
        confirmCallback = null;
    }

    function toggleEyedropper() {
        isEyedropperActive = !isEyedropperActive;
        comparisonSlider.classList.toggle('eyedropper-active', isEyedropperActive);
        if (isEyedropperActive) {
            comparisonSlider.addEventListener('mousemove', updateEyedropper);
            comparisonSlider.addEventListener('click', handleEyedropperClick);
            eyedropperLoupe.style.display = 'block';
        } else {
            comparisonSlider.removeEventListener('mousemove', updateEyedropper);
            comparisonSlider.removeEventListener('click', handleEyedropperClick);
            eyedropperLoupe.style.display = 'none';
        }
    }

    function updateEyedropper(e) {
        if (!isEyedropperActive) return;

        const img = previewBeforeImg;
        if (!img.complete || img.naturalHeight === 0) return;

        const rect = img.getBoundingClientRect();

        const naturalRatio = img.naturalWidth / img.naturalHeight;
        const clientRatio = rect.width / rect.height;

        let renderedWidth, renderedHeight, offsetX, offsetY;

        if (naturalRatio > clientRatio) {
            renderedWidth = rect.width;
            renderedHeight = renderedWidth / naturalRatio;
            offsetX = 0;
            offsetY = (rect.height - renderedHeight) / 2;
        } else {
            renderedHeight = rect.height;
            renderedWidth = renderedHeight * naturalRatio;
            offsetY = 0;
            offsetX = (rect.width - renderedWidth) / 2;
        }

        const mouseX = e.clientX - rect.left - offsetX;
        const mouseY = e.clientY - rect.top - offsetY;

        if (mouseX < 0 || mouseX > renderedWidth || mouseY < 0 || mouseY > renderedHeight) {
            eyedropperLoupe.style.display = 'none';
            return;
        } else {
            eyedropperLoupe.style.display = 'block';
        }
        
        const scaleX = img.naturalWidth / renderedWidth;
        const scaleY = img.naturalHeight / renderedHeight;

        const canvasX = mouseX * scaleX;
        const canvasY = mouseY * scaleY;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        
        const pixel = tempCtx.getImageData(canvasX, canvasY, 1, 1).data;
        const hex = `#${('00' + pixel[0].toString(16)).slice(-2)}${('00' + pixel[1].toString(16)).slice(-2)}${('00' + pixel[2].toString(16)).slice(-2)}`;
        
        eyedropperDisplay.style.backgroundColor = hex;
        eyedropperDisplay.innerHTML = `<span class="hex-code">${hex}</span>`;
        eyedropperDisplay.style.display = 'block';

        const loupeSize = 120;
        eyedropperLoupe.style.left = `${e.clientX - loupeSize / 2}px`;
        eyedropperLoupe.style.top = `${e.clientY - loupeSize / 2}px`;
        
        const zoomFactor = 10;
        loupeCtx.imageSmoothingEnabled = false;
        loupeCtx.clearRect(0, 0, loupeCanvas.width, loupeCanvas.height);
        loupeCtx.drawImage(
            img,
            canvasX - (loupeCanvas.width / zoomFactor / 2),
            canvasY - (loupeCanvas.height / zoomFactor / 2),
            loupeCanvas.width / zoomFactor,
            loupeCanvas.height / zoomFactor,
            0, 0, loupeCanvas.width, loupeCanvas.height
        );
    }

    function handleEyedropperClick(e) {
        updateEyedropper(e);
        copyToClipboard(eyedropperDisplay.querySelector('.hex-code').textContent, eyedropperDisplay.querySelector('.hex-code'));
        toggleEyedropper();
    }

    function copyToClipboard(text, element) {
        navigator.clipboard.writeText(text).then(() => {
            if (element) {
                const originalText = element.textContent;
                element.textContent = 'Copied!';
                setTimeout(() => { element.textContent = originalText; }, 1500);
            }
        });
    }

    function getPointerPosition(e, targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function handleWatermarkDragStart(e) {
        const state = imageStates.find(s => s.id === currentSelectedId);
        if (!state || state.settings.watermark.type === 'none' || !state.settings.watermark.lastRect) return;

        const pos = getPointerPosition(e, previewAfterImg);
        const rect = state.settings.watermark.lastRect;
        const scaleX = previewAfterImg.clientWidth / previewAfterImg.naturalWidth;
        const scaleY = previewAfterImg.clientHeight / previewAfterImg.naturalHeight;

        const watermarkScreenRect = {
            x: rect.x * scaleX,
            y: rect.y * scaleY,
            width: rect.width * scaleX,
            height: rect.height * scaleY
        };
        
        if (pos.x >= watermarkScreenRect.x && pos.x <= watermarkScreenRect.x + watermarkScreenRect.width &&
            pos.y >= watermarkScreenRect.y && pos.y <= watermarkScreenRect.y + watermarkScreenRect.height) {
            e.preventDefault();
            isDraggingWatermark = true;
            watermarkDragOffset = {
                x: pos.x - watermarkScreenRect.x,
                y: pos.y - watermarkScreenRect.y
            };
        }
    }

    function handleWatermarkDragMove(e) {
        if (!isDraggingWatermark) return;
        e.preventDefault();

        const state = imageStates.find(s => s.id === currentSelectedId);
        if (!state) return;

        const pos = getPointerPosition(e, previewAfterImg);
        const scaleX = previewAfterImg.naturalWidth / previewAfterImg.clientWidth;
        const scaleY = previewAfterImg.naturalHeight / previewAfterImg.clientHeight;
        
        const newWatermarkX = (pos.x - watermarkDragOffset.x) * scaleX;
        const newWatermarkY = (pos.y - watermarkDragOffset.y) * scaleY;
        
        state.settings.watermark.x = newWatermarkX / previewAfterImg.naturalWidth;
        state.settings.watermark.y = newWatermarkY / previewAfterImg.naturalHeight;
        state.settings.watermark.position = 'custom';
        
        watermarkPosition.value = 'custom';
        
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => compressSingleImage(state), 50);
    }

    function handleWatermarkDragEnd() {
        isDraggingWatermark = false;
    }

    initApp();
});
