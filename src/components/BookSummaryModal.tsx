// components/BookSummaryModal.tsx
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import type { Book } from "@/types/api";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  book: Book | null;
};

export default function BookSummaryModal({ open, onOpenChange, book }: Props) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!open || !book) return;
      setLoading(true); setError(""); setSummary("");
      try {
        const res = await apiClient.getBookSummary(book.id);
        console.log("Summary: ",res)
        if (mounted) setSummary(res.summary || "No summary available.");
      } catch (e:any) {
        if (mounted) setError("Failed to load summary. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [open, book]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-indigo-600">
            {book ? book.title : "Book Summary"}
          </DialogTitle>
          {book?.author && (
            <DialogDescription className="text-sm">
              by <span className="font-medium">{String(book.author)}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <Separator />

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <ScrollArea className="max-h-[50vh] pr-2">
            <p className="leading-7 whitespace-pre-wrap">{summary}</p>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
