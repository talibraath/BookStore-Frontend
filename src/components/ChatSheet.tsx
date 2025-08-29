// components/ChatSheet.tsx
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

export default function ChatSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await apiClient.chat({ message: userMsg.text });
      setMessages((prev) => [...prev, { role: "bot", text: res.text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Sorry, something went wrong." },
      ]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[350px] sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-indigo-600 font-bold">📚 BookBot</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg max-w-[85%] ${
                m.role === "user"
                  ? "ml-auto bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
