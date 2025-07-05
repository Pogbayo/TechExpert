import type { ChatHeaderProps } from "../Types/PropsTypes/props";

export default function ChatHeader({
  title,
  subtitle,
  onBack,
}: ChatHeaderProps) {
  return (
    <header
      className="flex items-center justify-between p-4 border-b"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-background)",
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="mr-4 text-[var(--color-primary)] hover:opacity-80"
          aria-label="Go back"
        >
          ←
        </button>
      )}
      <div className="flex flex-col flex-grow">
        <h1 className="text-lg font-semibold text-[var(--color-text)]">
          {title}
        </h1>
        {subtitle && (
          <span className="text-sm text-[var(--color-secondary)]">
            {subtitle}
          </span>
        )}
      </div>
    </header>
  );
}
