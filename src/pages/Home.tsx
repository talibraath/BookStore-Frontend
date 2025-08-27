import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Package, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookCard } from '@/components/BookCard';
import { apiClient } from '@/lib/api';
import type { Book } from '@/types/api';
import heroImage from '@/assets/hero-bookstore.jpg';

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const response = await apiClient.getBooks();
        // Get first 6 books as featured
        setFeaturedBooks(response.results.slice(0, 6));
      } catch (error) {
        console.error('Error fetching featured books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  const stats = [
    { icon: BookOpen, label: "Books", value: "10,000+" },
    { icon: Users, label: "Authors", value: "500+" },
    { icon: Package, label: "Orders", value: "25,000+" },
    { icon: Star, label: "Reviews", value: "50,000+" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[600px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-primary/70"></div>
        <div className="relative z-10 text-center text-primary-foreground max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Welcome to <span className="text-accent">BookVault</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
            Discover your next favorite book from our vast collection of literary treasures
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link to="/books">
                Browse Books
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/authors">
                Explore Authors
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center shadow-soft">
                <CardContent className="p-6">
                  <stat.icon className="h-12 w-12 mx-auto mb-4 text-accent" />
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">Featured Books</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of must-read books across all genres
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-[400px]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/books">
                View All Books
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-primary mb-6">About BookVault</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              BookVault is your premier destination for discovering and purchasing books online. 
              With our carefully curated collection spanning every genre and interest, we're committed 
              to connecting readers with the perfect book for every moment. From bestsellers to hidden gems, 
              classic literature to contemporary fiction, our vast library has something for every reader.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-accent/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Vast Selection</h3>
                <p className="text-muted-foreground">
                  Over 10,000 books across all genres and categories
                </p>
              </div>
              <div className="text-center">
                <div className="bg-accent/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Quick and reliable shipping to your doorstep
                </p>
              </div>
              <div className="text-center">
                <div className="bg-accent/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Service</h3>
                <p className="text-muted-foreground">
                  Exceptional customer service and book recommendations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}