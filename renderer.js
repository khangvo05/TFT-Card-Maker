/**
 * RENDERER.JS - FULL CUSTOMIZATION
 */

const RENDER_CONSTANTS = {
    WIDTH: 800,
    HEIGHT: 450,
};

function renderCard(ctx, state, assets) {
    const { WIDTH, HEIGHT } = RENDER_CONSTANTS;

    //CLEAR
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    //USER IMAGE
    if (state.image) {
        drawImageProp(ctx, state.image, 0, 0, WIDTH, HEIGHT, 0.5, 0.5, state.zoom);
    } else {
        ctx.fillStyle = '#1c1c1c';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    // BORDER (With Adjustable Thickness)
    const currentBorderH = state.borderHeight; // Get value from slider (e.g. 60)
    
    if (state.cost > 0 && assets.borders[state.cost]) {
        const borderImg = assets.borders[state.cost];
        const imgW = borderImg.width;
        const imgH = borderImg.height;

        // Dynamic 9-Slice Logic
        const sourceSplitRatio = 0.28; // Bar is bottom 28% of PNG
        const sourceBarH = imgH * sourceSplitRatio;
        const sourceWindowH = imgH - sourceBarH;
        
        const destWindowH = HEIGHT - currentBorderH;

        // Draw Window (Top)
        ctx.drawImage(borderImg, 0, 0, imgW, sourceWindowH, 0, 0, WIDTH, destWindowH);
        // Draw Bar (Bottom) - Squashed to user preference
        ctx.drawImage(borderImg, 0, sourceWindowH, imgW, sourceBarH, 0, destWindowH, WIDTH, currentBorderH);
    }

    // CHAMPION NAME
    // Center text vertically in the border bar
    const barCenterY = (HEIGHT - currentBorderH) + (currentBorderH / 2);
    const textY = barCenterY + (state.nameSize / 3)+ 7; 

    ctx.fillStyle = '#fff';
    ctx.font = `bold ${state.nameSize}px "${state.fontFamily}", sans-serif`; 
    ctx.textAlign = 'left';
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.lineWidth = 3;
    
    // Position text: X=30px padding, Y=Calculated Center
    ctx.strokeText(state.name.toUpperCase(), 30, textY); 
    ctx.fillText(state.name.toUpperCase(), 30, textY);
    ctx.shadowBlur = 0;

    // 5. TRAITS (Positioned Bottom-Left, Stacking Upwards)
    renderTraits(ctx, state, currentBorderH);
}

function renderTraits(ctx, state, borderH) {
    const { WIDTH, HEIGHT } = RENDER_CONSTANTS;
    
    // Start position: Bottom Left, just above the border bar
    const startX = 35;
    const startY = HEIGHT - borderH - 18; // 20px padding
    const gap = state.traitSize + 18; // Gap between traits based on icon size

    ctx.font = `bold ${state.traitFontSize}px "${state.fontFamily}", sans-serif`;
    ctx.textAlign = 'left';
    ctx.startY = startY;

    // Loop backwards or position them upwards
    state.traits.forEach((trait, index) => {
        // Calculate Y so they stack
        const yPos = startY - (index * gap);
        const iconSize = state.traitSize; 
        
        // Draw Icon
        if (trait.iconImg) {
            ctx.drawImage(trait.iconImg, startX, yPos - iconSize, iconSize, iconSize);
        } else {
            // Placeholder
            ctx.fillStyle = '#333';
            ctx.beginPath();
            // Center of placeholder
            ctx.arc(startX + (iconSize/2), yPos - (iconSize/2), iconSize/2, 0, 2 * Math.PI);
            ctx.fill();
        }

        //Draw Text
        const textX = startX + iconSize + 10; // Right of icon
        const textY = yPos - (iconSize / 2) + (state.traitFontSize / 3); // Vertically centered to icon

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(trait.name, textX, textY); 
        ctx.fillStyle = '#fff';
        ctx.fillText(trait.name, textX, textY);
    });
}

// STANDARD IMAGE HELPER
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY, zoom = 1) {
    if (arguments.length === 2) { x = y = 0; w = ctx.canvas.width; h = ctx.canvas.height; }
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;
    if (offsetX < 0) offsetX = 0; if (offsetY < 0) offsetY = 0; if (offsetX > 1) offsetX = 1; if (offsetY > 1) offsetY = 1;
    var iw = img.width, ih = img.height, r = Math.min(w / iw, h / ih), nw = iw * r, nh = ih * r, cx, cy, cw, ch, ar = 1;
    if (nw < w) ar = w / nw; if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; nw *= ar; nh *= ar; cw = iw / (nw / w); ch = ih / (nh / h); cx = (iw - cw) * offsetX; cy = (ih - ch) * offsetY;
    if (zoom > 1) { cw /= zoom; ch /= zoom; cx = (iw - cw) * offsetX; cy = (ih - ch) * offsetY; }
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}