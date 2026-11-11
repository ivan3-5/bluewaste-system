export const MAX_REPORT_PHOTOS = 5;
export const REPORT_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
export const CLEANUP_PHOTO_ACCEPT = `${REPORT_PHOTO_ACCEPT},image/gif`;
const maxPhotoBytes = 4 * 1024 * 1024;

export function selectReportPhotos(files: FileList | File[], remaining: number, accept = REPORT_PHOTO_ACCEPT) {
  const allowedTypes = new Set(accept.split(","));
  const photos: File[] = [];
  const errors = new Set<string>();
  for (const file of Array.from(files)) {
    if (!allowedTypes.has(file.type)) {
      errors.add(accept === CLEANUP_PHOTO_ACCEPT
        ? "Use JPG, PNG, WEBP, or GIF photos."
        : "Use JPG, PNG, or WEBP photos.");
    } else if (file.size === 0 || file.size > maxPhotoBytes) {
      errors.add("Each photo must be nonempty and no larger than 4 MB.");
    } else if (photos.length >= remaining) {
      errors.add(`You can attach up to ${MAX_REPORT_PHOTOS} photos.`);
    } else {
      photos.push(file);
    }
  }
  return { photos, error: [...errors].join(" ") };
}
