import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService, Product } from '../../services/supabase.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  isLoading = true;
  error = '';
  hasData = false;

  constructor(
    private supabaseService: SupabaseService,
    private cartService: CartService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadFeaturedProducts();
  }

  async loadFeaturedProducts(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = '';
      
      const products = await this.supabaseService.getProducts();
      
      this.featuredProducts = products.slice(0, 8); // Show first 8 products
      this.hasData = this.featuredProducts.length > 0;
      
      if (!this.hasData) {
        this.error = 'No featured products available.';
      }
    } catch (error) {
      this.error = 'Failed to load featured products.';
      this.hasData = false;
    } finally {
      this.isLoading = false;
    }
  }

  async refreshProducts(): Promise<void> {
    await this.loadFeaturedProducts();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }
} 