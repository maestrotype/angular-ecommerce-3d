/** Max raw .glb size before upload; server optimizes large files automatically. */
export const RAW_GLB_UPLOAD_MAX_BYTES = 200 * 1024 * 1024;

/** Show "optimizing…" hint when the raw file exceeds Cloudinary's post-optimize target. */
export const GLB_OPTIMIZE_HINT_BYTES = 10 * 1024 * 1024;
