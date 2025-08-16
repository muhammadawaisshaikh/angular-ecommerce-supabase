import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';
import { CartStore } from '../../services/cart.store';
import { ProductsStore } from '../../services/products.store';
import { computed } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private cartStore = inject(CartStore);
  private productsStore = inject(ProductsStore);

  // Use signals from the store
  readonly featuredProducts = this.productsStore.featuredProducts;
  readonly isLoading = this.productsStore.isLoading;
  readonly error = this.productsStore.error;
  readonly hasData = this.productsData;

  constructor() {
    // Listen to navigation events to reload products when returning to home
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      if (event.url === '/' || event.url === '/home') {
        this.loadFeaturedProducts();
      }
    });
  }

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadFeaturedProducts(): Promise<void> {
    try {
      // Clear any previous errors
      this.productsStore.clearError();
      
      // Load products (this will use the store's caching logic)
      await this.supabaseService.getProducts();
    } catch (error) {
      console.error('Error loading featured products:', error);
    }
  }

  async refreshProducts(): Promise<void> {
    // Force refresh by resetting the store
    this.productsStore.reset();
    await this.loadFeaturedProducts();
  }

  addToCart(product: any): void {
    this.cartStore.addToCart(product);
  }

  // Computed signal for hasData
  private get productsData() {
    return computed(() => this.productsStore.hasData());
  }
} 