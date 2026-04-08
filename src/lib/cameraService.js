/**
 * Returns all available video input devices.
 * Labels are only populated after the user has granted camera permission.
 * @returns {Promise<Array<{deviceId: string, label: string}>>}
 */
export async function listCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter(d => d.kind === 'videoinput')
    .map((d, i) => ({
      deviceId: d.deviceId,
      label: d.label || `Kamera ${i + 1}`,
    }));
}

/**
 * Starts the camera for the given device ID and returns the MediaStream.
 * If no deviceId is given, the browser's default camera is used.
 * @param {string} [deviceId]
 * @returns {Promise<MediaStream>}
 */
export async function startCameraById(deviceId) {
  const video = deviceId ? { deviceId: { exact: deviceId } } : true;
  return navigator.mediaDevices.getUserMedia({ video, audio: false });
}

/**
 * Stops all tracks of the given stream.
 * @param {MediaStream | null} stream
 */
export function stopCamera(stream) {
  stream?.getTracks().forEach(track => track.stop());
}
