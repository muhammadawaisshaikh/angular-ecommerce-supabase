import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Product } from '../../services/supabase.service';
import { CartStore } from '../../services/cart.store';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private cartStore = inject(CartStore);

  product: Product | null = null;
  quantity = 1;
  isLoading = true;
  error = '';

  async ngOnInit(): Promise<void> {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      await this.loadProduct(productId);
    } else {
      this.router.navigate(['/products']);
    }
  }

  async loadProduct(productId: string): Promise<void> {
    try {
      this.isLoading = true;
      this.product = await this.supabaseService.getProduct(productId);
      if (!this.product) {
        this.error = 'Product not found';
      }
    } catch (error) {
      console.error('Error loading product:', error);
      this.error = 'Failed to load product';
    } finally {
      this.isLoading = false;
    }
  }

  addToCart(): void {
    if (this.product && this.quantity > 0) {
      this.cartStore.addToCart(this.product, this.quantity);
      // Show success message or redirect to cart
    }
  }

  updateQuantity(change: number): void {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1 && newQuantity <= (this.product?.stock || 1)) {
      this.quantity = newQuantity;
    }
  }

  goBackToProducts(): void {
    this.router.navigate(['/products']);
  }
} 