import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, AuthResponse } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductsStore } from './products.store';

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id?: string;
  user_id?: string; // Optional for guest orders
  customer_info?: {
    fullName: string;
    email: string;
    phone: string;
  };
  products: OrderProduct[];
  total_amount: number;
  status: 'pending' | 'shipped' | 'delivered';
  shipping_address: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderProduct {
  product_id: string;
  quantity: number;
  price: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor(private productsStore: ProductsStore) {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
    this.initializeAuth();
  }

  private async initializeAuth() {
    const { data: { user } } = await this.supabase.auth.getUser();
    this.currentUser.next(user);
    
    this.supabase.auth.onAuthStateChange((event: string, session: any) => {
      this.currentUser.next(session?.user ?? null);
    });
  }

  // Authentication methods
  async signUp(email: string, password: string, fullName: string): Promise<any> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer'
        }
      }
    });
    
    if (!error && data.user) {
      await this.createUserProfile(data.user.id, email, fullName, 'customer');
    }
    
    return { data, error };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<void> {
    await this.supabase.auth.resetPasswordForEmail(email);
  }

  // User profile methods
  private async createUserProfile(userId: string, email: string, fullName: string, role: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role
      });
    
    if (error) console.error('Error creating user profile:', error);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) console.error('Error updating user profile:', error);
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    try {
      // Check if we need to fetch products
      if (!this.productsStore.shouldFetchProducts()) {
        return this.productsStore.products();
      }

      this.productsStore.setLoading(true);
      
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        this.productsStore.setError('Failed to load products');
        return [];
      }
      
      const products = data || [];
      this.productsStore.setProducts(products);
      return products;
    } catch (err) {
      this.productsStore.setError('Failed to load products');
      return [];
    } finally {
      this.productsStore.setLoading(false);
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (err) {
      return null;
    }
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      return null;
    }
    
    return data;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      return null;
    }
    
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) console.error('Error deleting product:', error);
  }

  // Order methods
  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating order:', error);
      return null;
    }
    
    return data;
  }

  async getOrders(userId?: string): Promise<Order[]> {
    let query = this.supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    
    return data || [];
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const { error } = await this.supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) console.error('Error updating order status:', error);
  }

  // File upload methods
  async uploadImage(file: File, path: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error } = await this.supabase.storage
      .from('product-images')
      .upload(filePath, file);
    
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    const { data } = this.supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  // Analytics methods
  async getDashboardStats(): Promise<{
    totalSales: number;
    activeOrders: number;
    totalProducts: number;
    topSellingProducts: Product[];
  }> {
    const [orders, products] = await Promise.all([
      this.getOrders(),
      this.getProducts()
    ]);
    
    const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const activeOrders = orders.filter(order => order.status === 'pending').length;
    const totalProducts = products.length;
    
    // Simple top selling logic - in production you'd want more sophisticated analytics
    const topSellingProducts = products.slice(0, 5);
    
    return {
      totalSales,
      activeOrders,
      totalProducts,
      topSellingProducts
    };
  }

  // Getters
  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  getCurrentUserValue(): User | null {
    return this.currentUser.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser.value;
  }

  isAdmin(): boolean {
    // This would need to be implemented based on your user role system
    return false;
  }
} 