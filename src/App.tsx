import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Header } from "@/components/Header";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";
import CartPage from "./pages/CartPage";
import AuthorsPage from "./pages/AuthorsPage";
import CategoriesPage from "./pages/CategoriesPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NotFound from "./pages/NotFound";
import AdminBooksPage from "./pages/admin/AdminBooksPage";
import BookFormPage from "./pages/admin/BookFormPage";
import AdminAuthorsPage from "./pages/admin/AdminAuthorsPage";
import AuthorFormPage from "./pages/admin/AuthorFormPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import CategoryFormPage from "./pages/admin/CategoryFormPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import MoodRecommendationsPage from "@/pages/MoodRecommendationsPage";
import { useState } from "react";
import ChatButton from "@/components/ChatButton";
import ChatModal from "@/components/ChatModal";
import ChatSheet from "./components/ChatSheet";

const queryClient = new QueryClient();

const App = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/books" element={<BooksPage />} />
                  <Route path="/books/:id" element={<BookDetailPage />} />
                  <Route path="/authors" element={<AuthorsPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/books" element={<AdminBooksPage />} />
                  <Route path="/admin/books/new" element={<BookFormPage />} />
                  <Route path="/admin/books/edit/:id" element={<BookFormPage />} />
                  <Route path="/admin/authors" element={<AdminAuthorsPage />} />
                  <Route path="/admin/authors/new" element={<AuthorFormPage />} />
                  <Route path="/admin/authors/edit/:id" element={<AuthorFormPage />} />
                  <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                  <Route path="/admin/categories/new" element={<CategoryFormPage />} />
                  <Route path="/admin/categories/edit/:id" element={<CategoryFormPage />} />
                  <Route path="/admin/orders" element={<AdminOrdersPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  <Route path="/recommendations/mood" element={<MoodRecommendationsPage />} />

                  {/* CATCH-ALL */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              {/* 👇 Global Chatbot components */}
             <ChatButton onClick={() => setChatOpen(true)} />
      <ChatSheet open={chatOpen} onOpenChange={setChatOpen} />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};




export default App;
