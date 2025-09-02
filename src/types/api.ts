export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'admin';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  role: 'customer' | 'admin';
  refresh: string;
  access: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'customer' | 'admin';
}

export interface Author {
  id: number;
  name: string;
  biography?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Book {
  id: number;
  title: string;
  description?: string;
  price: string;
  stock: number;
  pub_date: string;
  author: number;
  category: number;
  author_name?: string;
  category_name?: string;
  category_id?: Category;
  author_id?: Author;
}

export interface OrderItem {
  id?: number;
  book: number;
  quantity: number;
  price?: string;
  book_title?: string;
}

export interface Order {
  id: number;
  user: number;
  created_at: string;
  status: 'pending' | 'shipped' | 'delivered' | 'canceled';
  total_amount: string;
  items: OrderItem[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  detail?: string;
}