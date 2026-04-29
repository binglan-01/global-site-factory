export type ImageBlockProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
};

export function ImageBlock({ alt, className, loading = "lazy", src }: ImageBlockProps) {
  const imageClassName = ["factory-image-block", className].filter(Boolean).join(" ");

  return <img alt={alt} className={imageClassName} loading={loading} src={src} />;
}
