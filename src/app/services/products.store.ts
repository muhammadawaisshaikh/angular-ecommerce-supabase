import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from './supabase.service';

export interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
  lastFetched: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsStore {
  // State signals
  private _state = signal<ProductsState>({
    products: [],
    isLoading: false,
    error: null,
    hasData: false,
    lastFetched: null
  });

  // Public computed signals
  readonly products = computed(() => this._state().products);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);
  readonly hasData = computed(() => this._state().hasData);
  readonly lastFetched = computed(() => this._state().lastFetched);

  // Computed signals for filtered/sorted products
  readonly featuredProducts = computed(() => 
    this._state().products.slice(0, 8)
  );

  readonly categories = computed(() => {
    const categories = new Set<string>();
    this._state().products.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return Array.from(categories).sort();
  });

  // Get product by ID
  getProductById(id: string) {
    return computed(() => {
      return this._state().products.find(product => product.id === id) || null;
    });
  }

  // Set a single product (useful for product detail pages)
  setSingleProduct(product: Product): void {
    const currentProducts = this._state().products;
    const existingIndex = currentProducts.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      // Update existing product
      const updatedProducts = [...currentProducts];
      updatedProducts[existingIndex] = product;
      this.setProducts(updatedProducts);
    } else {
      // Add new product to the list
      this.setProducts([...currentProducts, product]);
    }
  }

  // Actions
  setLoading(loading: boolean): void {
    this._state.update(state => ({
      ...state,
      isLoading: loading,
      error: loading ? null : state.error
    }));
  }

  setProducts(products: Product[]): void {
    this._state.update(state => ({
      ...state,
      products,
      hasData: products.length > 0,
      error: null,
      lastFetched: Date.now()
    }));
  }

  setError(error: string): void {
    this._state.update(state => ({
      ...state,
      error,
      hasData: false,
      isLoading: false
    }));
  }

  clearError(): void {
    this._state.update(state => ({
      ...state,
      error: null
    }));
  }

  // Check if we need to fetch products (cache for 5 minutes)
  shouldFetchProducts(): boolean {
    const state = this._state();
    const cacheTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return (
      state.products.length === 0 ||
      state.lastFetched === null ||
      (Date.now() - state.lastFetched) > cacheTime
    );
  }

  // Reset state
  reset(): void {
    this._state.set({
      products: [],
      isLoading: false,
      error: null,
      hasData: false,
      lastFetched: null
    });
  }

  // Debug method
  getState(): ProductsState {
    return this._state();
  }
} 