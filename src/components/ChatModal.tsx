// components/ChatModal.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

export default function ChatModal({ open, onOpenChange }) {
  const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await apiClient.chat({ message: userMsg.text });
      setMessages((prev) => [...prev, { role: 'bot', text: res.text }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: "Sorry, something went wrong." }]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col h-[70vh]">
        <DialogHeader>
          <DialogTitle>Ask BookBot 📚</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 p-2">
          {messages.map((m, i) => (
            <div key={i} className={`p-2 rounded-lg max-w-[80%] ${m.role === 'user' ? 'ml-auto bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question..." />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
