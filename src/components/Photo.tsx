import Image from "next/image";

/**
 * A framed photograph sized to the site's card radius. Wraps next/image so
 * every photo gets the same treatment and automatic optimization.
 */
export default function Photo({
  src,
  alt,
  height = 340,
  priority = false,
  sizes = "(max-width: 980px) 100vw, 50vw",
}: {
  src: string;
  alt: string;
  height?: number;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: "var(--radius)",
        overflow: "hidden",
        background: "var(--sage-light)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
