import type { 
  LoginCredentials, 
  LoginResponse, 
  RegisterData, 
  User, 
  Book, 
  Author, 
  Category, 
  Order, 
  OrderItem,
  PaginatedResponse 
} from '@/types/api';

const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'API request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store tokens
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    localStorage.setItem('user_role', response.role);
    localStorage.setItem('username', response.username);
    
    return response;
  }

  async register(userData: RegisterData): Promise<User> {
    return this.request<User>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await this.request('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }
    
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
  }

  // Books endpoints
  async getBooks(page?: number): Promise<PaginatedResponse<Book>> {
    const params = page ? `?page=${page}` : '';
    return this.request<PaginatedResponse<Book>>(`/catalog/books/${params}`);
  }

  async getBook(id: number): Promise<Book> {
    return this.request<Book>(`/catalog/books/${id}/`);
  }

  async createBook(book: Omit<Book, 'id'>): Promise<Book> {
    return this.request<Book>('/catalog/books/', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  }

  async updateBook(id: number, book: Partial<Book>): Promise<Book> {
    return this.request<Book>(`/catalog/books/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(book),
    });
  }

  async deleteBook(id: number): Promise<void> {
    await this.request(`/catalog/books/${id}/`, {
      method: 'DELETE',
    });
  }

  // Authors endpoints
  async getAuthors(page?: number): Promise<PaginatedResponse<Author>> {
    const params = page ? `?page=${page}` : '';
    return this.request<PaginatedResponse<Author>>(`/catalog/authors/${params}`);
  }

  async createAuthor(author: Omit<Author, 'id'>): Promise<Author> {
    return this.request<Author>('/catalog/authors/', {
      method: 'POST',
      body: JSON.stringify(author),
    });
  }

  async updateAuthor(id: number, author: Partial<Author>): Promise<Author> {
    return this.request<Author>(`/catalog/authors/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(author),
    });
  }

  async deleteAuthor(id: number): Promise<void> {
    await this.request(`/catalog/authors/${id}/`, {
      method: 'DELETE',
    });
  }

  // Categories endpoints
  async getCategories(page?: number): Promise<PaginatedResponse<Category>> {
    const params = page ? `?page=${page}` : '';
    return this.request<PaginatedResponse<Category>>(`/catalog/categories/${params}`);
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    return this.request<Category>('/catalog/categories/', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/catalog/categories/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    await this.request(`/catalog/categories/${id}/`, {
      method: 'DELETE',
    });
  }

  // Orders endpoints
  async getOrders(page?: number): Promise<PaginatedResponse<Order>> {
    const params = page ? `?page=${page}` : '';
    return this.request<PaginatedResponse<Order>>(`/orders/${params}`);
  }

  async createOrder(items: OrderItem[]): Promise<Order> {
    return this.request<Order>('/orders/', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  async updateOrderStatus(id: number, status: Order['status']): Promise<Order> {
    return this.request<Order>(`/orders/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Password reset endpoints
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password-reset-request/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async confirmPasswordReset(email: string, otp: string, new_password: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password-reset-confirm/', {
      method: 'POST',
      body: JSON.stringify({ email, otp, new_password }),
    });
  }

  // Profile endpoints
  async getProfile(): Promise<User> {
    return this.request<User>('/profile/users/');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>('/profile/users/', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/profile/users/change-password/', {
      method: 'PATCH',
      body: JSON.stringify({ new_password: newPassword }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);