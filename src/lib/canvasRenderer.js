// ─── Palette helpers ──────────────────────────────────────────────────────────

const PALETTES = {
  hearts: { base: '#fff3f8', ink: '#2a1020', a: '#ff4f8b',  b: '#ffd1e3' },
  autumn: { base: '#fff3e4', ink: '#2a1b10', a: '#d36b1e',  b: '#f1b36a' },
  spring: { base: '#f2fff3', ink: '#102a18', a: '#22c36a',  b: '#bff2cc' },
  summer: { base: '#fffdf0', ink: '#1a1f2a', a: '#ffd166',  b: '#63d9ff' },
  winter: { base: '#f1f7ff', ink: '#0e2333', a: '#6ac9ff',  b: '#c7e7ff' },
};
const DEFAULT_PALETTE = { base: '#f7f6f3', ink: '#101010', a: '#444444', b: '#dddddd' };

export function themePalette(theme) {
  return PALETTES[theme] ?? DEFAULT_PALETTE;
}

export function hexToRgba(hex, alpha) {
  const h = (hex ?? '').replace('#', '').trim();
  if (h.length !== 6) return `rgba(255,209,102,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Shape helpers ────────────────────────────────────────────────────────────

export function drawRoundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// ─── Background ───────────────────────────────────────────────────────────────

export function drawBackground(ctx, width, height, { bg, bgIntensity, theme }) {
  const { base, a, b } = themePalette(theme);
  const intensity = bgIntensity / 100;

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  if (bg === 'solid') return;

  if (bg === 'paper') {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255,255,255,.70)');
    gradient.addColorStop(1, 'rgba(0,0,0,.05)');
    ctx.globalAlpha = 0.35 + 0.55 * intensity;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    return;
  }

  if (bg === 'gradient') {
    const gradient = ctx.createRadialGradient(
      width * 0.35, height * 0.25, 50,
      width * 0.5, height * 0.5, Math.max(width, height)
    );
    gradient.addColorStop(0, hexToRgba(a, 0.22 * intensity));
    gradient.addColorStop(1, hexToRgba(b, 0.16 * intensity));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  // pattern
  ctx.save();
  ctx.globalAlpha = 0.12 + 0.30 * intensity;
  ctx.strokeStyle = 'rgba(0,0,0,.40)';
  ctx.lineWidth = 1;
  for (let x = -height; x < width; x += 34) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height, height);
    ctx.stroke();
  }
  ctx.restore();
}

// ─── Outer border ─────────────────────────────────────────────────────────────

export function drawOuterBorder(ctx, width, height, { theme, themeIntensity }) {
  const { ink, a } = themePalette(theme);
  const s = theme === 'off' ? 0 : themeIntensity / 100;

  ctx.save();
  ctx.lineWidth = 7;
  ctx.strokeStyle = hexToRgba(ink, 0.22 + 0.20 * s);
  drawRoundedRect(ctx, 10, 10, width - 20, height - 20, 28);
  ctx.stroke();

  if (s > 0) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = hexToRgba(a, 0.30 + 0.35 * s);
    drawRoundedRect(ctx, 24, 24, width - 48, height - 48, 26);
    ctx.stroke();
  }
  ctx.restore();
}

// ─── Caption ──────────────────────────────────────────────────────────────────

export function drawCaption(ctx, width, height, { caption, theme }) {
  const parts = buildCaptionParts(caption);
  if (!parts.length) return;

  const { ink } = themePalette(theme);
  ctx.save();
  ctx.fillStyle = hexToRgba(ink, 0.88);
  ctx.font = '900 36px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.textAlign = 'center';
  ctx.fillText(parts.join(' • '), width / 2, height - 30);
  ctx.restore();
}

export function drawCaptionAt(ctx, x, y, { caption, theme }) {
  const parts = buildCaptionParts(caption);
  if (!parts.length) return;

  const { ink } = themePalette(theme);
  ctx.save();
  ctx.fillStyle = hexToRgba(ink, 0.88);
  ctx.font = '900 34px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.textAlign = 'center';
  ctx.fillText(parts.join(' • '), x, y);
  ctx.restore();
}

export function hasCaption({ caption }) {
  return !!(caption?.trim());
}

function buildCaptionParts(caption) {
  const parts = [];
  if (caption?.trim()) parts.push(caption.trim());
  return parts;
}

// ─── Theme overlay ────────────────────────────────────────────────────────────

export function drawThemeOverlay(ctx, width, height, { theme, themeIntensity }) {
  if (theme === 'off') return;

  const { ink, a, b } = themePalette(theme);
  const s = themeIntensity / 100;

  ctx.save();
  ctx.globalAlpha = 0.35 + 0.45 * s;
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = hexToRgba(a, 0.10 + 0.25 * s);
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = hexToRgba(b, 0.08 + 0.22 * s);
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.55 + 0.35 * s;

  const overlayFn = THEME_OVERLAY_MAP[theme] ?? overlaySketch;
  overlayFn(ctx, width, height, a, b, ink, s);

  ctx.restore();
}

// ─── Shot drawing ─────────────────────────────────────────────────────────────

const SHAPE_SEQUENCE = ['rounded', 'circle', 'heart', 'triangle', 'hex', 'ticket'];

export function drawShot(ctx, image, x, y, w, h, radius, index, shape) {
  const resolvedShape = shape === 'mix'
    ? SHAPE_SEQUENCE[index % SHAPE_SEQUENCE.length]
    : shape;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.25)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 12;

  clipToShape(ctx, x, y, w, h, resolvedShape, radius);
  ctx.clip();
  ctx.drawImage(image, x, y, w, h);

  if (resolvedShape === 'ticket') punchTicketNotches(ctx, x, y, w, h);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,.10)';
  ctx.lineWidth = 3;
  clipToShape(ctx, x, y, w, h, resolvedShape, radius);
  ctx.stroke();
  ctx.restore();
}

// ─── Clip path shapes ─────────────────────────────────────────────────────────

function clipToShape(ctx, x, y, w, h, shape, r) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const m = Math.min(w, h);

  ctx.beginPath();

  switch (shape) {
    case 'rect':
      ctx.rect(x, y, w, h);
      return;
    case 'rounded':
    case 'ticket':
      drawRoundedRect(ctx, x, y, w, h, r);
      return;
    case 'circle':
      ctx.arc(cx, cy, (m / 2) * 0.98, 0, Math.PI * 2);
      return;
    case 'triangle': {
      const pad = m * 0.06;
      ctx.moveTo(cx, y + pad);
      ctx.lineTo(x + w - pad, y + h - pad);
      ctx.lineTo(x + pad, y + h - pad);
      ctx.closePath();
      return;
    }
    case 'hex': {
      const rad = (m / 2) * 0.98;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + Math.cos(angle) * rad;
        const py = cy + Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      return;
    }
    case 'heart':
      drawHeartPath(ctx, cx, cy - (m / 2) * 1.05 * 0.08, (m / 2) * 1.05);
      return;
    default:
      drawRoundedRect(ctx, x, y, w, h, r);
  }
}

function drawHeartPath(ctx, cx, cy, size) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.30);
  ctx.bezierCurveTo(cx - size * 0.55, cy - size * 0.10, cx - size * 0.55, cy + size * 0.65, cx, cy + size * 0.95);
  ctx.bezierCurveTo(cx + size * 0.55, cy + size * 0.65, cx + size * 0.55, cy - size * 0.10, cx, cy + size * 0.30);
  ctx.closePath();
}

function punchTicketNotches(ctx, x, y, w, h) {
  const notch = Math.min(w, h) * 0.12;
  const cy = y + h / 2;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, cy, notch, -Math.PI / 2, Math.PI / 2, false);
  ctx.arc(x + w, cy, notch, Math.PI / 2, -Math.PI / 2, false);
  ctx.fill();
  ctx.restore();
}

// ─── Theme overlays ───────────────────────────────────────────────────────────

function jitterLine(ctx, x1, y1, x2, y2, jitter = 3.0, segments = 18) {
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter;
    const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function overlayHearts(ctx, w, h, a, b, ink, s) {
  for (let i = 0; i < 12; i++) {
    const x = [w * 0.18, w * 0.52, w * 0.82][i % 3];
    const y = 90 + i * 120;
    const size = 70 + (i % 4) * 18 + 40 * s;
    ctx.fillStyle = hexToRgba(i % 2 === 0 ? a : b, 0.55);
    drawHeartPath(ctx, x + rand(-30, 30), y + rand(-20, 20), size);
    ctx.fill();
  }
  ctx.strokeStyle = hexToRgba(ink, 0.35);
  ctx.lineWidth = 4;
  jitterLine(ctx, 40, 90, w - 60, 70, 3.6, 18);
  jitterLine(ctx, 60, h - 140, w - 80, h - 170, 3.6, 18);
}

function overlayAutumn(ctx, w, h, a, b, ink, s) {
  for (let i = 0; i < 10; i++) {
    const x = 60 + i * (w - 120) / 9;
    const y = 120 + Math.sin(i * 0.7) * 80 + i * 70;
    const size = 70 + 30 * s;
    ctx.fillStyle = hexToRgba(i % 2 ? a : b, 0.55);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.35 + i * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.55);
    ctx.bezierCurveTo(size * 0.55, -size * 0.35, size * 0.55, size * 0.25, 0, size * 0.60);
    ctx.bezierCurveTo(-size * 0.55, size * 0.25, -size * 0.55, -size * 0.35, 0, -size * 0.55);
    ctx.closePath();
    ctx.restore();
    ctx.fill();
  }
  ctx.strokeStyle = hexToRgba(ink, 0.28);
  ctx.lineWidth = 5;
  jitterLine(ctx, 30, 160, w * 0.65, 60, 4.2, 16);
  jitterLine(ctx, w - 30, 210, w * 0.45, 70, 4.2, 16);
}

function overlaySpring(ctx, w, h, a, b, ink, s) {
  for (let i = 0; i < 18; i++) {
    const x = 80 + (i % 6) * (w - 160) / 5;
    const y = 110 + Math.floor(i / 6) * 220 + rand(-30, 30);
    const size = 28 + 12 * s;
    ctx.fillStyle = hexToRgba(i % 2 ? a : b, 0.60);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const angle = k * Math.PI / 3;
      const fx = x + Math.cos(angle) * size;
      const fy = y + Math.sin(angle) * size;
      ctx.moveTo(fx, fy);
      ctx.arc(fx, fy, size * 0.60, 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = hexToRgba(ink, 0.22);
  ctx.lineWidth = 5;
  for (let i = 0; i < 4; i++) {
    jitterLine(ctx, 40, 120 + i * 180, w - 60, 60 + i * 160, 4.0, 18);
  }
}

function overlaySummer(ctx, w, h, a, b, ink, s) {
  ctx.fillStyle = hexToRgba(a, 0.55);
  ctx.beginPath();
  ctx.arc(w - 120, 120, 90 + 50 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = hexToRgba(ink, 0.28);
  ctx.lineWidth = 5;
  for (let i = 0; i < 12; i++) {
    const ang = i * Math.PI / 6;
    jitterLine(
      ctx,
      w - 120 + Math.cos(ang) * (120 + 40 * s), 120 + Math.sin(ang) * (120 + 40 * s),
      w - 120 + Math.cos(ang) * (150 + 55 * s), 120 + Math.sin(ang) * (150 + 55 * s),
      3.0, 8
    );
  }

  ctx.strokeStyle = hexToRgba(b, 0.55);
  ctx.lineWidth = 6;
  for (let row = 0; row < 6; row++) {
    const yy = 190 + row * 55;
    ctx.beginPath();
    for (let x = 30; x < w - 30; x += 16) {
      const y = yy + Math.sin(x * 0.03 + row) * 10;
      if (x === 30) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function overlayWinter(ctx, w, h, a, b, ink, s) {
  ctx.strokeStyle = hexToRgba(a, 0.70);
  ctx.lineWidth = 5;
  for (let i = 0; i < 9; i++) {
    const x = 90 + (i % 3) * (w - 180) / 2 + rand(-20, 20);
    const y = 120 + Math.floor(i / 3) * 260 + rand(-20, 20);
    const size = 26 + 18 * s;
    for (let k = 0; k < 6; k++) {
      const angle = k * Math.PI / 3;
      jitterLine(ctx, x, y, x + Math.cos(angle) * size * 3.0, y + Math.sin(angle) * size * 3.0, 2.0, 6);
      const bx = x + Math.cos(angle) * size * 1.8;
      const by = y + Math.sin(angle) * size * 1.8;
      jitterLine(ctx, bx, by, bx + Math.cos(angle + 0.7) * size * 1.2, by + Math.sin(angle + 0.7) * size * 1.2, 1.6, 4);
      jitterLine(ctx, bx, by, bx + Math.cos(angle - 0.7) * size * 1.2, by + Math.sin(angle - 0.7) * size * 1.2, 1.6, 4);
    }
  }
  ctx.strokeStyle = hexToRgba(ink, 0.22);
  ctx.lineWidth = 5;
  jitterLine(ctx, 40, 110, w - 60, 80, 4.0, 18);
  jitterLine(ctx, 60, h - 160, w - 80, h - 190, 4.0, 18);
}

function overlaySketch(ctx, w, h, a, b, ink, s) {
  ctx.strokeStyle = hexToRgba(ink, 0.40);
  ctx.lineWidth = 6;
  for (let i = 0; i < 3; i++) {
    jitterLine(ctx, 30, 70 + i * 12, w - 30, 55 + i * 10, 5.0, 20);
    jitterLine(ctx, 40, h - 160 - i * 10, w - 40, h - 180 - i * 12, 5.0, 20);
    jitterLine(ctx, 40 + i * 12, 70, 20 + i * 10, h - 170, 5.0, 20);
    jitterLine(ctx, w - 40 - i * 12, 70, w - 20 - i * 10, h - 170, 5.0, 20);
  }
  ctx.strokeStyle = hexToRgba(a, 0.60);
  ctx.lineWidth = 5;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(90 + rand(-30, 30) + i * 45, 150 + rand(-40, 40), 18 + 12 * s, 0, Math.PI * 2);
    ctx.stroke();
  }
}

const THEME_OVERLAY_MAP = {
  hearts: overlayHearts,
  autumn: overlayAutumn,
  spring: overlaySpring,
  summer: overlaySummer,
  winter: overlayWinter,
  sketch: overlaySketch,
};
