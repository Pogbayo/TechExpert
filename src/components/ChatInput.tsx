// src/components/ChatInput.tsx
import { useState } from "react";
import type { ChatInputProps } from "../Types/chat";

export default function ChatInput({ onSend }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() !== "") {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div
      className="flex p-2 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 p-2 rounded-lg bg-[var(--color-input-bg)] text-[var(--color-input-text)] outline-none"
        placeholder="Type a message"
      />
      <button
        onClick={handleSend}
        className="ml-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white"
      >
        Send
      </button>
    </div>
  );
}
