// Cloudinary can resize and re-encode on the fly: inserting a transformation after /upload/ returns a smaller,
// optimised copy (e.g. "c_limit,w_900,q_auto,f_auto"). Other URLs are returned unchanged.
export function cloudinaryUrl(url: string, transformation: string) {
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/${transformation}/`) : url;
}
