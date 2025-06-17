import type { AvatarProps } from "../Types/chat";

export default function Avatar({
  src,
  alt = "User avatar",
  size = 40,
  initials,
}: AvatarProps) {
  const style = {
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: "var(--color-primary)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    userSelect: "none" as const,
  };

  if (src) {
    return <img src={src} alt={alt} style={style} />;
  }

  return <div style={style}>{initials ? initials.toUpperCase() : "?"}</div>;
}
