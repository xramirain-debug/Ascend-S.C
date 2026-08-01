import Image from "next/image";

/**
 * Site photography. Each picture's intrinsic dimensions live here so its
 * frame can take the photo's own proportions — the whole image is shown,
 * never cropped to fit a fixed height.
 */
export const photos = {
  careTeam: { src: "/photo-care-team.jpg", width: 1280, height: 698 },
  documentation: { src: "/photo-documentation.jpg", width: 1280, height: 854 },
  clinical: { src: "/photo-clinical.jpg", width: 1024, height: 683 },
} as const;

export type PhotoName = keyof typeof photos;

export default function Photo({
  name,
  alt,
  priority = false,
  sizes = "(max-width: 980px) 100vw, 50vw",
}: {
  name: PhotoName;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  const photo = photos[name];
  return (
    <Image
      src={photo.src}
      alt={alt}
      width={photo.width}
      height={photo.height}
      sizes={sizes}
      priority={priority}
      style={{
        width: "100%",
        height: "auto",
        borderRadius: "var(--radius)",
        display: "block",
      }}
    />
  );
}
