import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CartStore } from '../../services/cart.store';
import { ProductsStore } from '../../services/products.store';
import { Subject } from 'rxjs';
import { HeroCarouselComponent } from '../shared';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroCarouselComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private supabaseService = inject(SupabaseService);
  private cartStore = inject(CartStore);
  private productsStore = inject(ProductsStore);
  private destroy$ = new Subject<void>();

  // Use signals from the store
  readonly featuredProducts = this.productsStore.featuredProducts;
  readonly isLoading = this.productsStore.isLoading;
  readonly error = this.productsStore.error;
  readonly hasData = this.productsStore.hasData;

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadFeaturedProducts(): Promise<void> {
    if (this.productsStore.shouldFetchProducts()) {
      try {
        await this.supabaseService.getProducts();
      } catch (error) {
        console.error('Error loading featured products:', error);
      }
    }
  }

  refreshProducts(): void {
    this.productsStore.reset();
    this.loadFeaturedProducts();
  }

  addToCart(product: any): void {
    this.cartStore.addToCart(product, 1);
  }
} 