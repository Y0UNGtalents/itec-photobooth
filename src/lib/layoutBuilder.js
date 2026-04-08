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
