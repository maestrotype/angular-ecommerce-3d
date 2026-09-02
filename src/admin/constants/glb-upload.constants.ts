/** Max raw .glb size accepted for upload before server-side optimization. */
export const RAW_GLB_UPLOAD_MAX_BYTES = 200 * 1024 * 1024;

/** Max size allowed in DB / CDN after optimization. */
export const MAX_STORED_GLB_BYTES = 50 * 1024 * 1024;

/** Show "optimizing…" hint when the raw file exceeds Cloudinary's post-optimize target. */
export const GLB_OPTIMIZE_HINT_BYTES = 10 * 1024 * 1024;
