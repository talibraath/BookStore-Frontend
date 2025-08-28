import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Book, 
  ShoppingCart, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import type { Book as BookType, Author, Category, Order, PaginatedResponse } from '@/types/api';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalAuthors: 0,
    totalCategories: 0,
    totalOrders: 0,
  });
  const [recentBooks, setRecentBooks] = useState<BookType[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [booksResponse, authorsResponse, categoriesResponse, ordersResponse] = await Promise.all([
        apiClient.getBooks(),
        apiClient.getAuthors(),
        apiClient.getCategories(),
        apiClient.getOrders(),
      ]);

      setStats({
        totalBooks: booksResponse.count,
        totalAuthors: authorsResponse.count,
        totalCategories: categoriesResponse.count,
        totalOrders: ordersResponse.count,
      });

      setRecentBooks(booksResponse.results.slice(0, 5));
      setRecentOrders(ordersResponse.results.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-destructive/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Package className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">
            You don't have permission to access the admin panel. 
            Please contact an administrator if you believe this is an error.
          </p>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getStatusBadge = (status: Order['status']) => {
    const variants = {
      pending: 'secondary' as const,
      shipped: 'default' as const,
      delivered: 'secondary' as const,
      canceled: 'destructive' as const,
    };
    return variants[status] || 'secondary';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your bookstore and monitor business metrics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAuthors}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Same as last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +18% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Commonly used admin functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-auto p-4 flex-col">
              <Link to="/admin/books/new">
                <Plus className="h-6 w-6 mb-2" />
                Add New Book
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4 flex-col">
              <Link to="/admin/authors">
                <Plus className="h-6 w-6 mb-2" />
                Manage Authors
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4 flex-col">
              <Link to="/admin/categories">
                <Plus className="h-6 w-6 mb-2" />
                Manage Categories
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Books */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Books</CardTitle>
              <CardDescription>Latest books added to the catalog</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/books">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="h-12 w-8 bg-muted rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentBooks.map((book) => (
                  <div key={book.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-12 bg-gradient-primary rounded flex-shrink-0"></div>
                      <div>
                        <p className="font-medium line-clamp-1">{book.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(book.price)} • Stock: {book.stock}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/books/${book.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} items • {formatPrice(order.total_amount)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Link to={`/orders/${order.id}`}>
                                         <Eye className="h-4 w-4" />
                                            </Link>
                       
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Management Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-elevated transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Book className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="text-lg font-semibold mb-2">Manage Books</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add, edit, and organize your book catalog
            </p>
            <Button variant="outline" asChild>
              <Link to="/admin/books">Manage Books</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevated transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="text-lg font-semibold mb-2">Order Management</h3>
            <p className="text-sm text-muted-foreground mb-4">
              View and update customer orders
            </p>
            <Button variant="outline" asChild>
              <Link to="/admin/orders">Manage Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevated transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="text-lg font-semibold mb-2">Authors & Categories</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage authors and book categories
            </p>
            <Button variant="outline" asChild>
              <Link to="/admin/authors">Manage Authors</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}