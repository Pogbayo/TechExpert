import type { ButtonProps } from "../Types/chat";

export default function Button({ label, onClick, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 ${className}`}
    >
      {label}
    </button>
  );
}
