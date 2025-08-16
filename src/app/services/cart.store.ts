import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from './supabase.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartStore {
  // State signals
  private _state = signal<CartState>({
    items: [],
    total: 0,
    itemCount: 0
  });

  // Public computed signals
  readonly items = computed(() => this._state().items);
  readonly total = computed(() => this._state().total);
  readonly itemCount = computed(() => this._state().itemCount);

  // Computed signals for cart operations
  readonly isEmpty = computed(() => this._state().items.length === 0);

  constructor() {
    this.loadCartFromStorage();
    
    // Effect to save cart to storage whenever it changes
    effect(() => {
      this.saveCartToStorage();
    });
  }

  private loadCartFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          this.updateCart(cartData);
        } catch (error) {
          console.error('Error loading cart from storage:', error);
          this.updateCart([]);
        }
      }
    }
  }

  private saveCartToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('cart', JSON.stringify(this._state().items));
    }
  }

  private updateCart(items: CartItem[]): void {
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    this._state.set({
      items,
      total,
      itemCount
    });
  }

  // Actions
  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this._state().items;
    const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);

    let newItems: CartItem[];
    
    if (existingItemIndex >= 0) {
      newItems = [...currentItems];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + quantity
      };
    } else {
      newItems = [...currentItems, { product, quantity }];
    }

    this.updateCart(newItems);
  }

  removeFromCart(productId: string): void {
    const currentItems = this._state().items;
    const filteredItems = currentItems.filter(item => item.product.id !== productId);
    this.updateCart(filteredItems);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this._state().items;
    const itemIndex = currentItems.findIndex(item => item.product.id === productId);
    
    if (itemIndex >= 0) {
      const newItems = [...currentItems];
      newItems[itemIndex] = { ...newItems[itemIndex], quantity };
      this.updateCart(newItems);
    }
  }

  clearCart(): void {
    this.updateCart([]);
  }

  isProductInCart(productId: string): boolean {
    return this._state().items.some(item => item.product.id === productId);
  }

  getProductQuantity(productId: string): number {
    const item = this._state().items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }

  // Debug method
  getState(): CartState {
    return this._state();
  }
} 