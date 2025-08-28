import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  ArrowLeft,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import type { Author } from '@/types/api';

export default function AdminAuthorsPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchAuthors();
    }
  }, [isAdmin]);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getAuthors();
      setAuthors(response.results);
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load authors.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuthor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this author?')) return;
    
    try {
      await apiClient.deleteAuthor(id);
      toast({
        title: "Success",
        description: "Author deleted successfully.",
      });
      fetchAuthors();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete author.",
      });
    }
  };

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page.
        </p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Manage Authors</h1>
              <p className="text-muted-foreground">
                Add, edit, and manage book authors
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/admin/authors/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Author
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search Authors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search authors by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Authors List */}
      <Card>
        <CardHeader>
          <CardTitle>Authors ({filteredAuthors.length})</CardTitle>
          <CardDescription>
            Manage your author database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="h-12 w-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAuthors.map((author) => (
                <div key={author.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{author.name}</h3>
                      {author.biography && (
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                          {author.biography}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/admin/authors/edit/${author.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteAuthor(author.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredAuthors.length === 0 && !loading && (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No authors found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'No authors match your search.' : 'Start by adding your first author.'}
                  </p>
                  <Button asChild>
                    <Link to="/admin/authors/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Author
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}