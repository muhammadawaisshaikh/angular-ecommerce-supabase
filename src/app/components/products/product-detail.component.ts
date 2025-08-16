import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Product } from '../../services/supabase.service';
import { CartStore } from '../../services/cart.store';
import { ProductsStore } from '../../services/products.store';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private cartStore = inject(CartStore);
  private productsStore = inject(ProductsStore);

  // Local state signals
  private _quantity = signal(1);
  private _productId = signal<string | null>(null);

  // Computed signals
  readonly quantity = this._quantity.asReadonly();
  readonly productId = this._productId.asReadonly();

  // Product signal - will be computed based on productId
  readonly product = computed(() => {
    const id = this._productId();
    if (!id) return null;
    return this.productsStore.getProductById(id)();
  });

  // Loading and error states from store
  readonly isLoading = this.productsStore.isLoading;
  readonly error = this.productsStore.error;

  async ngOnInit(): Promise<void> {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this._productId.set(productId);
      await this.loadProduct(productId);
    } else {
      this.router.navigate(['/products']);
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  async loadProduct(productId: string): Promise<void> {
    try {
      console.log('Loading product with ID:', productId);
      
      // Clear any previous errors
      this.productsStore.clearError();
      
      // Set loading state
      this.productsStore.setLoading(true);
      
      // Check if product is already in store
      const existingProduct = this.productsStore.getProductById(productId)();
      console.log('Existing product in store:', existingProduct);
      
      if (existingProduct) {
        // Product already exists in store, no need to fetch
        console.log('Product found in store, skipping API call');
        this.productsStore.setLoading(false);
        return;
      }

      console.log('Product not in store, fetching from API...');
      
      // Fetch product from API
      const product = await this.supabaseService.getProduct(productId);
      console.log('Product from API:', product);
      
      if (product) {
        // Add product to store
        this.productsStore.setSingleProduct(product);
        console.log('Product added to store');
      } else {
        console.log('Product not found in API');
        this.productsStore.setError('Product not found');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      this.productsStore.setError('Failed to load product');
    } finally {
      this.productsStore.setLoading(false);
    }
  }

  async refreshProduct(): Promise<void> {
    const productId = this._productId();
    if (productId) {
      await this.loadProduct(productId);
    }
  }

  addToCart(): void {
    const currentProduct = this.product();
    if (currentProduct && this._quantity() > 0) {
      this.cartStore.addToCart(currentProduct, this._quantity());
      // Show success message or redirect to cart
    }
  }

  updateQuantity(change: number): void {
    const currentProduct = this.product();
    if (!currentProduct) return;
    
    const newQuantity = this._quantity() + change;
    if (newQuantity >= 1 && newQuantity <= currentProduct.stock) {
      this._quantity.set(newQuantity);
    }
  }

  updateQuantityFromSelect(newQuantity: number): void {
    const currentProduct = this.product();
    if (!currentProduct) return;
    
    const quantity = parseInt(newQuantity.toString());
    if (quantity >= 1 && quantity <= currentProduct.stock) {
      this._quantity.set(quantity);
    }
  }

  goBackToProducts(): void {
    this.router.navigate(['/products']);
  }
} 