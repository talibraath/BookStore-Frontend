import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import type { Book, Author, Category } from '@/types/api';

export default function BookFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: 0,
    pub_date: '',
    author: '',
    category: '',
  });

  useEffect(() => {
    if (isAdmin) {
      fetchInitialData();
    }
  }, [isAdmin]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [authorsResponse, categoriesResponse] = await Promise.all([
        apiClient.getAuthors(),
        apiClient.getCategories(),
      ]);

      setAuthors(authorsResponse.results);
      setCategories(categoriesResponse.results);

      if (isEditing && id) {
        const book = await apiClient.getBook(parseInt(id));
        setFormData({
          title: book.title,
          description: book.description || '',
          price: book.price,
          stock: book.stock,
          pub_date: book.pub_date,
          author: book.author.toString(),
          category: book.category.toString(),
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load form data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        pub_date: formData.pub_date,
        author: parseInt(formData.author),
        category: parseInt(formData.category),
      };

      if (isEditing && id) {
        await apiClient.updateBook(parseInt(id), bookData);
        toast({
          title: "Success",
          description: "Book updated successfully.",
        });
      } else {
        await apiClient.createBook(bookData);
        toast({
          title: "Success",
          description: "Book created successfully.",
        });
      }

      navigate('/admin/books');
    } catch (error) {
      console.error('Error saving book:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} book.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/books">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Edit Book' : 'Add New Book'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update book information' : 'Add a new book to your catalog'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Book Information</CardTitle>
          <CardDescription>
            Fill in the details below to {isEditing ? 'update' : 'create'} the book.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter book title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter book description"
                rows={4}
              />
            </div>

            {/* Author */}
            <div>
              <Label htmlFor="author">Author *</Label>
              <Select
                value={formData.author}
                onValueChange={(value) => handleInputChange('author', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an author" />
                </SelectTrigger>
                <SelectContent>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id.toString()}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Publication Date */}
            <div>
              <Label htmlFor="pub_date">Publication Date *</Label>
              <Input
                id="pub_date"
                type="date"
                value={formData.pub_date}
                onChange={(e) => handleInputChange('pub_date', e.target.value)}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link to="/admin/books">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : (isEditing ? 'Update Book' : 'Create Book')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}