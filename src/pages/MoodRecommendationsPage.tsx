import { useState } from "react";
import { BookCard } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import type { Book } from "@/types/api";
import { Loader2 } from "lucide-react";

const MOODS = [
  "happy",
  "sad",
  "adventurous",
  "romantic",
  "thoughtful",
  "chill",
  "scared",
  "curious",
];

export default function MoodRecommendationsPage() {
  const [mood, setMood] = useState<string>("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleFetch = async (selectedMood: string) => {
    if (!prompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please type how you’re feeling or what you want first.",
        variant: "destructive",
      });
      return;
    }

    setMood(selectedMood);
    setLoading(true);
    try {
      const res = await apiClient.getMoodRecommendations({
        mood: selectedMood,
        prompt,
        limit: 8,
      });
      setBooks(res.results);
    } catch (err) {
      console.error("Error fetching recommendations", err);
      toast({
        title: "Error",
        description: "Could not load recommendations. Try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (book: Book) => {
    addToCart(book, 1);
    toast({
      title: "Added to cart",
      description: `${book.title} has been added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-indigo-600">
          Mood Based Recommendations
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Type how you feel or what you’re in the mood for, then pick a vibe —
          we’ll recommend the perfect books for you.
        </p>
      </div>

      {/* Prompt input */}
      <div className="max-w-2xl mx-auto flex gap-3 mb-10">
        <Input
          placeholder="e.g., I want something relaxing before bed..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 border-gray-300 focus-visible:ring-indigo-500 rounded-lg"
        />
      </div>

      {/* Mood selector */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {MOODS.map((m) => (
          <Button
            key={m}
            size="sm"
            className={`rounded-full px-5 py-2 text-sm transition-all ${
              mood === m
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-indigo-100"
            }`}
            onClick={() => handleFetch(m)}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </Button>
        ))}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
        </div>
      )}

      {/* Results grid */}
      {!loading && books.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <div
              key={book.id}
              className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
            >
              <BookCard
                book={{
                  ...book,
                  image: `https://picsum.photos/300/400?random=${book.id}`,
                }}
                onAddToCart={() => handleAddToCart(book)}
              />
              {book.reason && (
                <div className="mt-3 mb-4 text-sm text-center text-indigo-600 italic bg-indigo-50 px-4 py-2">
                  {book.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && books.length === 0 && mood && (
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            No books found for mood{" "}
            <span className="text-indigo-600 font-bold">{mood}</span>
          </h3>
          <p className="text-gray-500">
            Try changing your mood or adjusting your prompt.
          </p>
        </div>
      )}
    </div>
  );
}
