import {
  drawBackground,
  drawOuterBorder,
  drawCaption,
  drawCaptionAt,
  drawThemeOverlay,
  drawShot,
  drawRoundedRect,
  hexToRgba,
  themePalette,
  hasCaption,
} from './canvasRenderer.js';

const ASPECT_RATIO = 4 / 3;

/**
 * Builds the final composite image from captured frames.
 *
 * @param {string[]} frames - JPEG data URLs
 * @param {object} settings
 * @returns {Promise<string>} JPEG data URL of the composed image
 */
export async function buildLayout(frames, settings) {
  const images = await loadImages(frames);

  switch (settings.layout) {
    case 'strip':   return buildStrip(images, settings);
    case 'polaroid': return buildPolaroid(images, settings);
    case 'collage': return buildCollage(images, settings);
    default:        return buildGrid(images, settings);
  }
}

// ─── Strip layout ─────────────────────────────────────────────────────────────

function buildStrip(images, settings) {
  const { gap, shape } = settings;
  const padding = 36;
  const labelHeight = hasCaption(settings) ? 88 : 26;
  const imageWidth = 860;
  const imageHeight = Math.round(imageWidth / ASPECT_RATIO);

  const canvasWidth = padding * 2 + imageWidth;
  const canvasHeight = padding * 2 + images.length * imageHeight + (images.length - 1) * gap + labelHeight;
  const { canvas, ctx } = createCanvas(canvasWidth, canvasHeight);

  drawBackground(ctx, canvasWidth, canvasHeight, settings);

  let y = padding;
  images.forEach((img, index) => {
    drawShot(ctx, img, padding, y, imageWidth, imageHeight, 20, index, shape);
    y += imageHeight + gap;
  });

  drawThemeOverlay(ctx, canvasWidth, canvasHeight, settings);
  drawOuterBorder(ctx, canvasWidth, canvasHeight, settings);
  drawCaption(ctx, canvasWidth, canvasHeight, settings);

  return canvas.toDataURL('image/jpeg', 0.95);
}

// ─── Grid layout ──────────────────────────────────────────────────────────────

function buildGrid(images, settings) {
  const { gap, shape } = settings;
  const count = images.length;
  const { cols, rows } = computeGrid(count);
  const padding = 36;
  const labelHeight = hasCaption(settings) ? 88 : 26;

  const cellWidth = cols <= 2 ? 860 : cols === 3 ? 620 : 500;
  const cellHeight = Math.round(cellWidth / ASPECT_RATIO);

  const canvasWidth = padding * 2 + cols * cellWidth + (cols - 1) * gap;
  const canvasHeight = padding * 2 + rows * cellHeight + (rows - 1) * gap + labelHeight;
  const { canvas, ctx } = createCanvas(canvasWidth, canvasHeight);

  drawBackground(ctx, canvasWidth, canvasHeight, settings);

  let index = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (index >= count) break;
      const x = padding + col * (cellWidth + gap);
      const y = padding + row * (cellHeight + gap);
      drawShot(ctx, images[index], x, y, cellWidth, cellHeight, 18, index, shape);
      index++;
    }
  }

  drawThemeOverlay(ctx, canvasWidth, canvasHeight, settings);
  drawOuterBorder(ctx, canvasWidth, canvasHeight, settings);
  drawCaption(ctx, canvasWidth, canvasHeight, settings);

  return canvas.toDataURL('image/jpeg', 0.95);
}

// ─── Polaroid layout ──────────────────────────────────────────────────────────

function buildPolaroid(images, settings) {
  const lastImage = images[images.length - 1];
  const padding = 44;
  const labelHeight = hasCaption(settings) ? 88 : 26;
  const framePadding = 28;
  const bottomExtra = 120;

  const photoWidth = 820;
  const photoHeight = Math.round(photoWidth / ASPECT_RATIO);

  const canvasWidth = padding * 2 + photoWidth + framePadding * 2;
  const canvasHeight = padding * 2 + photoHeight + framePadding * 2 + bottomExtra + labelHeight;
  const { canvas, ctx } = createCanvas(canvasWidth, canvasHeight);

  drawBackground(ctx, canvasWidth, canvasHeight, settings);
  drawPolaroidFrame(ctx, padding, padding, canvasWidth - 2 * padding, canvasHeight - 2 * padding - labelHeight);
  drawShot(ctx, lastImage, padding + framePadding, padding + framePadding, photoWidth, photoHeight, 12, 0, settings.shape);

  drawThemeOverlay(ctx, canvasWidth, canvasHeight, settings);
  drawOuterBorder(ctx, canvasWidth, canvasHeight, settings);

  const captionY = padding + framePadding + photoHeight + 70;
  drawCaptionAt(ctx, canvasWidth / 2, captionY, settings);

  return canvas.toDataURL('image/jpeg', 0.95);
}

function drawPolaroidFrame(ctx, x, y, w, h) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.25)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#fff';
  drawRoundedRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.restore();
}

// ─── Collage layout ───────────────────────────────────────────────────────────

function buildCollage(images, settings) {
  const count = images.length;

  // Grid columns based on photo count
  const cols = count <= 3 ? 3 : count <= 6 ? 3 : 4;
  const rows = Math.ceil(count / cols);

  const margin    = 52;
  const gapX      = 28;
  const gapY      = 28;
  const framePad  = 13;  // white border thickness
  const polaroidBt = 52; // white space below photo (polaroid look)

  const canvasW = 1200;
  const availW  = canvasW - 2 * margin - (cols - 1) * gapX;
  const frameW  = Math.floor(availW / cols);
  const photoW  = frameW - 2 * framePad;
  const photoH  = Math.round(photoW / ASPECT_RATIO);
  const frameH  = photoH + 2 * framePad + polaroidBt;

  const contentH = rows * frameH + (rows - 1) * gapY;
  const canvasH  = contentH + 2 * margin + (hasCaption(settings) ? 80 : 30);

  const { canvas, ctx } = createCanvas(canvasW, canvasH);
  drawBackground(ctx, canvasW, canvasH, settings);

  // Deterministic rotation and jitter per slot
  const ROTS   = [-8, 6, -5, 9, -3, 7, -6, 4, -7, 5, -4, 8];
  const JITTER = [
    { x: -12, y:  8 }, { x: 16, y: -10 }, { x:  -7, y: -12 },
    { x:  11, y: 13 }, { x: -14, y:   5 }, { x:   8, y:  -9 },
    { x:  -9, y: 11 }, { x: 13, y:  -7 },
  ];

  const slots = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const rowCount = row === rows - 1 ? count - row * cols : cols;
    const rowShift = (cols - rowCount) * (frameW + gapX) / 2;

    const baseX = margin + rowShift + col * (frameW + gapX) + frameW / 2;
    const baseY = margin + row * (frameH + gapY) + frameH / 2;
    const j = JITTER[i % JITTER.length];
    slots.push({ cx: baseX + j.x, cy: baseY + j.y, rot: ROTS[i % ROTS.length] });
  }

  // Draw from back (last) to front (first) so first photo appears on top
  for (let i = count - 1; i >= 0; i--) {
    const { cx, cy, rot } = slots[i];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rot * Math.PI) / 180);

    // White polaroid frame with shadow
    ctx.shadowColor   = 'rgba(0,0,0,.28)';
    ctx.shadowBlur    = 20;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle     = '#ffffff';
    drawRoundedRect(ctx, -frameW / 2, -frameH / 2, frameW, frameH, 6);
    ctx.fill();
    ctx.shadowColor   = 'transparent';
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetY = 0;

    // Photo inside frame
    drawShot(ctx, images[i], -photoW / 2, -frameH / 2 + framePad, photoW, photoH, 4, i, settings.shape);

    ctx.restore();
  }

  drawThemeOverlay(ctx, canvasW, canvasH, settings);
  drawOuterBorder(ctx, canvasW, canvasH, settings);
  drawCaption(ctx, canvasW, canvasH, settings);

  return canvas.toDataURL('image/jpeg', 0.95);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d') };
}

function computeGrid(count) {
  let cols = Math.ceil(Math.sqrt(count));
  let rows = Math.ceil(count / cols);
  if (rows > cols) { cols += 1; rows = Math.ceil(count / cols); }
  return { cols, rows };
}

function loadImages(dataUrls) {
  return Promise.all(
    dataUrls.map(src => {
      const img = new Image();
      img.src = src;
      return img.decode().then(() => img);
    })
  );
}
