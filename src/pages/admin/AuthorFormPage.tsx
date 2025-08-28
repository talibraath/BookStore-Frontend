import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

export default function AuthorFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    biography: '',
  });

  useEffect(() => {
    if (isEditing && id && isAdmin) {
      fetchAuthor();
    }
  }, [isEditing, id, isAdmin]);

  const fetchAuthor = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Note: We need to implement getAuthor method or fetch from list
      const authorsResponse = await apiClient.getAuthors();
      const author = authorsResponse.results.find(a => a.id === parseInt(id));
      
      if (author) {
        setFormData({
          name: author.name,
          biography: author.biography || '',
        });
      }
    } catch (error) {
      console.error('Error fetching author:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load author data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authorData = {
        name: formData.name,
        biography: formData.biography,
      };

      if (isEditing && id) {
        await apiClient.updateAuthor(parseInt(id), authorData);
        toast({
          title: "Success",
          description: "Author updated successfully.",
        });
      } else {
        await apiClient.createAuthor(authorData);
        toast({
          title: "Success",
          description: "Author created successfully.",
        });
      }

      navigate('/admin/authors');
    } catch (error) {
      console.error('Error saving author:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} author.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
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
            <Link to="/admin/authors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Edit Author' : 'Add New Author'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update author information' : 'Add a new author to your database'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Author Information</CardTitle>
          <CardDescription>
            Fill in the details below to {isEditing ? 'update' : 'create'} the author.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter author name"
                required
              />
            </div>

            {/* Biography */}
            <div>
              <Label htmlFor="biography">Biography</Label>
              <Textarea
                id="biography"
                value={formData.biography}
                onChange={(e) => handleInputChange('biography', e.target.value)}
                placeholder="Enter author biography"
                rows={6}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link to="/admin/authors">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : (isEditing ? 'Update Author' : 'Create Author')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}