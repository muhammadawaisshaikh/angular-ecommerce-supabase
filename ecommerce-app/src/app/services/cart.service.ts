import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './supabase.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        this.cartItems.next(cartData);
      } catch (error) {
        console.error('Error loading cart from storage:', error);
        this.cartItems.next([]);
      }
    }
  }

  private saveCartToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  getCartItemsValue(): CartItem[] {
    return this.cartItems.value;
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems.value;
    const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (existingItemIndex >= 0) {
      currentItems[existingItemIndex].quantity += quantity;
    } else {
      currentItems.push({ product, quantity });
    }

    this.cartItems.next([...currentItems]);
    this.saveCartToStorage();
  }

  removeFromCart(productId: string): void {
    const currentItems = this.cartItems.value;
    const filteredItems = currentItems.filter(item => item.product.id !== productId);
    this.cartItems.next(filteredItems);
    this.saveCartToStorage();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex(item => item.product.id === productId);
    
    if (itemIndex >= 0) {
      currentItems[itemIndex].quantity = quantity;
      this.cartItems.next([...currentItems]);
      this.saveCartToStorage();
    }
  }

  clearCart(): void {
    this.cartItems.next([]);
    localStorage.removeItem('cart');
  }

  getCartTotal(): number {
    return this.cartItems.value.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  getCartItemCount(): number {
    return this.cartItems.value.reduce((total, item) => total + item.quantity, 0);
  }

  isProductInCart(productId: string): boolean {
    return this.cartItems.value.some(item => item.product.id === productId);
  }

  getProductQuantity(productId: string): number {
    const item = this.cartItems.value.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }
} 