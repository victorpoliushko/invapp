/**
 * Renders an SVG as a CSS mask filled with `currentColor`, so one icon file
 * can follow the text color (active/inactive, hover) of its parent.
 */
export function MaskIcon({ src, size }: { src: string; size: number }) {
  // Quoted: Vite inlines small SVGs as data URIs containing quotes, which
  // break an unquoted url().
  const url = `url("${src}")`;
  return (
    <span
      className="mask-icon"
      style={{ width: size, height: size, maskImage: url, WebkitMaskImage: url }}
      aria-hidden="true"
    />
  );
}
