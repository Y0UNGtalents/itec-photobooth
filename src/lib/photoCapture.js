const TARGET_ASPECT_RATIO = 4 / 3;
const OUTPUT_WIDTH = 900;

const FILTER_MAP = {
  bw: 'grayscale(100%) contrast(1.08)',
  vintage: 'sepia(0.55) contrast(1.10) saturate(1.15)',
  warm: 'sepia(0.25) saturate(1.35) contrast(1.05)',
  contrast: 'contrast(1.25) saturate(1.1)',
};

/**
 * Captures a single frame from the video element and returns a JPEG data URL.
 *
 * @param {HTMLVideoElement} video
 * @param {{ filter: string, mirrorOn: boolean, facing: string }} options
 * @returns {string} JPEG data URL
 */
export function captureFrame(video, { filter, mirrorOn, facing }) {
  const { videoWidth, videoHeight } = video;
  if (!videoWidth || !videoHeight) throw new Error('Video nicht bereit');

  const { sx, sy, sw, sh } = cropSourceToAspectRatio(videoWidth, videoHeight);
  const outputHeight = Math.round(OUTPUT_WIDTH / TARGET_ASPECT_RATIO);

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_WIDTH;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');

  ctx.save();
  if (mirrorOn && facing === 'user') {
    ctx.translate(OUTPUT_WIDTH, 0);
    ctx.scale(-1, 1);
  }
  ctx.filter = FILTER_MAP[filter] ?? 'none';
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, OUTPUT_WIDTH, outputHeight);
  ctx.restore();
  ctx.filter = 'none';

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Calculates the source crop coordinates to match the target aspect ratio.
 */
function cropSourceToAspectRatio(videoWidth, videoHeight) {
  const sourceAspectRatio = videoWidth / videoHeight;

  if (sourceAspectRatio > TARGET_ASPECT_RATIO) {
    const sw = Math.round(videoHeight * TARGET_ASPECT_RATIO);
    return { sx: Math.round((videoWidth - sw) / 2), sy: 0, sw, sh: videoHeight };
  }

  const sh = Math.round(videoWidth / TARGET_ASPECT_RATIO);
  return { sx: 0, sy: Math.round((videoHeight - sh) / 2), sw: videoWidth, sh };
}
