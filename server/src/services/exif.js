import exifr from 'exifr';

/**
 * Pull the two things that matter from a photo buffer: where and when.
 * Returns { lat, lng, takenAt } with nulls where data is missing.
 */
export async function extractExif(buffer) {
  try {
    const data = await exifr.parse(buffer, {
      gps: true,
      pick: ['DateTimeOriginal', 'CreateDate', 'latitude', 'longitude'],
    });

    if (!data) return { lat: null, lng: null, takenAt: null };

    const lat = typeof data.latitude === 'number' ? data.latitude : null;
    const lng = typeof data.longitude === 'number' ? data.longitude : null;
    const takenAt = data.DateTimeOriginal || data.CreateDate || null;

    return { lat, lng, takenAt };
  } catch {
    // Corrupt/unsupported EXIF should never block an upload.
    return { lat: null, lng: null, takenAt: null };
  }
}
