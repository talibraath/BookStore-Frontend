// components/ChatButton.tsx
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center justify-center"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}
