import Image from "next/image";

export function ProductImage({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-sand ${className}`}>
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
      </div>
    );
  }
  // Elegant placeholder until a photo is uploaded
  return (
    <div className={`relative flex items-center justify-center bg-sand ${className}`} role="img" aria-label={alt}>
      <svg viewBox="0 0 64 64" className="w-1/4 text-tan" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M32 54 10 26l8-12h28l8 12-22 28Z" />
        <path d="M10 26h44M22 14l10 40 10-40M18 14l14 12 14-12" />
      </svg>
    </div>
  );
}
