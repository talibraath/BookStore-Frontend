import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingCart, User, Menu, X, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-primary hover:text-accent transition-colors">
            <BookOpen className="h-8 w-8" />
            <span className="text-xl font-bold">BookVault</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/books" className="text-foreground hover:text-accent transition-colors font-medium">
              Books
            </Link>
            <Link to="/authors" className="text-foreground hover:text-accent transition-colors font-medium">
              Authors
            </Link>
            <Link to="/categories" className="text-foreground hover:text-accent transition-colors font-medium">
              Categories
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-foreground hover:text-accent transition-colors font-medium">
                Admin
                <Badge variant="secondary" className="ml-2">Admin</Badge>
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/books"
                className="text-foreground hover:text-accent transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Books
              </Link>
              <Link
                to="/authors"
                className="text-foreground hover:text-accent transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Authors
              </Link>
              <Link
                to="/categories"
                className="text-foreground hover:text-accent transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-foreground hover:text-accent transition-colors font-medium flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                  <Badge variant="secondary" className="ml-2">Admin</Badge>
                </Link>
              )}
              
              <div className="pt-4 border-t border-border">
                <Link
                  to="/cart"
                  className="flex items-center text-foreground hover:text-accent transition-colors font-medium mb-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Cart
                </Link>
                
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <Link
                      to="/profile"
                      className="flex items-center text-foreground hover:text-accent transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="mr-2 h-5 w-5" />
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center text-foreground hover:text-accent transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      My Orders
                    </Link>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button variant="default" asChild className="w-full justify-start">
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}