

// STATE
const cardState = {
    name: "Silco",
    cost: 0,
    image: null,
    zoom: 1.0,
    // STYLING OPTIONS
    nameSize: 40,
    borderHeight: 60,
    traitSize: 40,
    traitFontSize: 20,
    fontFamily: "Beaufort for LOL",
    traits: [] 
};

//ASSETS
const loadedAssets = { borders: {} };
const loadedTraitIcons = {}; 
let currentEditingTraitId = null;

const dom = {
    canvas: document.getElementById('cardCanvas'),
    ctx: document.getElementById('cardCanvas').getContext('2d'),
    inputs: {
        name: document.getElementById('inputName'),
        cost: document.getElementById('selectCost'),
        image: document.getElementById('uploadImage'),
        zoom: document.getElementById('zoomSlider'),
        // NEW INPUTS
        nameSize: document.getElementById('nameSizeInput'),
        borderHeight: document.getElementById('borderHeightInput'),
        traitSize: document.getElementById('traitSizeInput'),
        traitFontSize: document.getElementById('traitFontSizeInput'),
        fontFamily: document.getElementById('fontFamilyInput'),
    },
    containers: {
        traitList: document.getElementById('traitList'),
        addTraitBtn: document.getElementById('addTraitBtn'),
        downloadBtn: document.getElementById('downloadBtn')
    },
    modal: {
        overlay: document.getElementById('iconModal'),
        grid: document.getElementById('iconGrid'),
        closeBtn: document.getElementById('closeModalBtn'),
        search: document.getElementById('traitSearch'),
    },
    tooltip: document.getElementById('customTooltip')
};

// INIT
function init() {
    console.log("System: Pro Suite Loaded.");
    loadAssetsBackground();
    
    if (typeof TRAIT_MANIFEST !== 'undefined') {
        buildIconGrid(""); 
    } else {
        console.error("Error: traits.js is not loaded or empty.");
    }

    attachStaticListeners();
    dom.containers.traitList.innerHTML = ''; 
    addTrait(); 
    triggerRender();
}

// BUILD GRID
function buildIconGrid(filterText) {
    dom.modal.grid.innerHTML = ''; 
    const lowerFilter = filterText ? filterText.toLowerCase() : "";

    TRAIT_MANIFEST.forEach(item => {
        let displayName, fileName;

        if (typeof item === 'string') {
            displayName = item;
            // Assume .svg if just a string, otherwise use as is
            fileName = item.includes('.') ? item : item + ".svg";
        } else {
            displayName = item.name;
            fileName = item.file;
        }

        // FILTE
        if (displayName && displayName.toLowerCase().includes(lowerFilter)) {
            const div = document.createElement('div');
            div.className = 'grid-item';
            
            // TOOLTIP
            div.addEventListener('mousemove', (e) => showTooltip(e, displayName));
            div.addEventListener('mouseleave', hideTooltip);

            const img = document.createElement('img');
            img.loading = "lazy"; 
            img.src = `./assets/traits/${encodeURIComponent(fileName)}`; 
            
            div.appendChild(img);

            div.addEventListener('click', () => {
                selectIconForTrait({ name: displayName, file: fileName });
                hideTooltip(); 
            });

            dom.modal.grid.appendChild(div);
        }
    });
}

// TOOLTIP
function showTooltip(e, text) {
    dom.tooltip.textContent = text;
    dom.tooltip.classList.remove('hidden');
    dom.tooltip.style.left = (e.clientX + 15) + 'px';
    dom.tooltip.style.top = (e.clientY + 10) + 'px';
}
function hideTooltip() {
    dom.tooltip.classList.add('hidden');
}

// ADD TRAIT
function addTrait() {
    const newTrait = { id: Date.now(), icon: null, name: "" };
    cardState.traits.push(newTrait);

    const row = document.createElement('div');
    row.className = 'trait-row';
    row.dataset.id = newTrait.id; 

    row.innerHTML = `
        <button class="trait-select-btn" title="Select Icon">
            <span class="btn-text">+</span>
            <img class="btn-preview" style="display:none; width: 100%;">
        </button>
        <input type="text" class="trait-name-input" placeholder="Trait Name">
        <button class="btn-remove">X</button>
    `;

    dom.containers.traitList.appendChild(row);

    const selectBtn = row.querySelector('.trait-select-btn');
    const nameInput = row.querySelector('.trait-name-input');
    const removeBtn = row.querySelector('.btn-remove');

    selectBtn.addEventListener('click', () => {
        currentEditingTraitId = newTrait.id;
        dom.modal.search.value = "";
        buildIconGrid(""); 
        openModal();
    });

    nameInput.addEventListener('input', (e) => {
        const trait = cardState.traits.find(t => t.id === newTrait.id);
        if (trait) trait.name = e.target.value;
        triggerRender();
    });

    removeBtn.addEventListener('click', () => {
        row.remove();
        cardState.traits = cardState.traits.filter(t => t.id !== newTrait.id);
        triggerRender();
    });
}

// SELECT ICON
async function selectIconForTrait(item) {
    const trait = cardState.traits.find(t => t.id === currentEditingTraitId);
    if (!trait) return;

    const imgObj = await loadTraitIcon(item.file);
    trait.iconImg = imgObj;
    trait.icon = item.file; 
    trait.name = item.name; 

    const row = document.querySelector(`.trait-row[data-id="${currentEditingTraitId}"]`);
    if (row) {
        const btnText = row.querySelector('.btn-text');
        const btnImg = row.querySelector('.btn-preview');
        
        btnText.style.display = 'none';
        btnImg.style.display = 'block';
        btnImg.src = `./assets/traits/${encodeURIComponent(item.file)}`;
        
        const nameInput = row.querySelector('.trait-name-input');
        if (nameInput) nameInput.value = item.name; 
    }

    closeModal();
    triggerRender();
}

// ASSETS & LISTENERS
function openModal() { dom.modal.overlay.classList.remove('hidden'); dom.modal.search.focus(); }
function closeModal() { dom.modal.overlay.classList.add('hidden'); currentEditingTraitId = null; }

dom.modal.closeBtn.addEventListener('click', closeModal);
dom.modal.overlay.addEventListener('click', (e) => { if (e.target === dom.modal.overlay) closeModal(); });

dom.modal.search.addEventListener('input', (e) => {
    buildIconGrid(e.target.value); 
});

function loadTraitIcon(filename) {
    return new Promise((resolve) => {
        if (loadedTraitIcons[filename]) { resolve(loadedTraitIcons[filename]); return; }
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = `./assets/traits/${encodeURIComponent(filename)}`;
        img.onload = () => { loadedTraitIcons[filename] = img; resolve(img); };
        img.onerror = () => { resolve(null); }
    });
}

function loadAssetsBackground() {
    [1, 2, 3, 4, 5, 6].forEach(cost => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = `./assets/borders/${cost}cost.png`;
        img.onload = () => {
            loadedAssets.borders[cost] = img;
            if (cardState.cost === cost) triggerRender();
        };
    });
}

function triggerRender() {
    renderCard(dom.ctx, cardState, loadedAssets);
}

function attachStaticListeners() {
    // Basic Controls
    dom.inputs.name.addEventListener('input', (e) => { cardState.name = e.target.value; triggerRender(); });
    dom.inputs.cost.addEventListener('change', (e) => { cardState.cost = parseInt(e.target.value); triggerRender(); });
    dom.inputs.zoom.addEventListener('input', (e) => { cardState.zoom = parseFloat(e.target.value); triggerRender(); });
    dom.inputs.fontFamily.addEventListener('change', (e) => {
        cardState.fontFamily = e.target.value;
        triggerRender();
    });
    
    dom.inputs.nameSize.addEventListener('input', (e) => { cardState.nameSize = parseInt(e.target.value); triggerRender(); });
    dom.inputs.borderHeight.addEventListener('input', (e) => { cardState.borderHeight = parseInt(e.target.value); triggerRender(); });
    dom.inputs.traitSize.addEventListener('input', (e) => { cardState.traitSize = parseInt(e.target.value); triggerRender(); });
    dom.inputs.traitFontSize.addEventListener('input', (e) => { cardState.traitFontSize = parseInt(e.target.value); triggerRender(); });

    // Image Upload
    dom.inputs.image.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => { cardState.image = img; triggerRender(); };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    dom.containers.addTraitBtn.addEventListener('click', () => addTrait());
    dom.containers.downloadBtn.addEventListener('click', downloadCard);
}

function downloadCard() {
    try {
        const link = document.createElement('a');
        link.download = `tft_${cardState.name.replace(/[^a-z0-9]/gi, '_')}.png`;
        link.href = dom.canvas.toDataURL('image/png');
        link.click();
    } catch (e) { alert("Download failed. Check console."); }
}

init();