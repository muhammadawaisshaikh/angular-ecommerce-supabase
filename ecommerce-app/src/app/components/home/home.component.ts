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

  constructor(
    private supabaseService: SupabaseService,
    private cartService: CartService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadFeaturedProducts();
  }

  async loadFeaturedProducts(): Promise<void> {
    try {
      const products = await this.supabaseService.getProducts();
      this.featuredProducts = products.slice(0, 8); // Show first 8 products
    } catch (error) {
      console.error('Error loading featured products:', error);
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }
} 