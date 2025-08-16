import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { CartStore } from '../../services/cart.store';
import { ProductsStore } from '../../services/products.store';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  private supabaseService = inject(SupabaseService);
  private cartStore = inject(CartStore);
  private productsStore = inject(ProductsStore);

  // Local state signals
  private _searchTerm = signal('');
  private _selectedCategory = signal('');
  private _sortBy = signal('name');
  private _currentPage = signal(1);
  private _itemsPerPage = signal(12);

  // Computed signals
  readonly allProducts = this.productsStore.products;
  readonly isLoading = this.productsStore.isLoading;
  readonly error = this.productsStore.error;
  readonly hasData = this.productsStore.hasData;
  readonly categories = this.productsStore.categories;

  readonly searchTerm = this._searchTerm.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly sortBy = this._sortBy.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly itemsPerPage = this._itemsPerPage.asReadonly();

  // Computed filtered and paginated products
  readonly filteredProducts = computed(() => {
    let products = this.allProducts();
    
    // Apply search filter
    if (this._searchTerm()) {
      const search = this._searchTerm().toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search)
      );
    }
    
    // Apply category filter
    if (this._selectedCategory()) {
      products = products.filter(product => 
        product.category === this._selectedCategory()
      );
    }
    
    // Apply sorting
    switch (this._sortBy()) {
      case 'price-low':
        products = [...products].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products = [...products].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products = [...products].sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        break;
      default: // name
        products = [...products].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return products;
  });

  readonly totalPages = computed(() => {
    const total = this.filteredProducts().length;
    return Math.ceil(total / this._itemsPerPage());
  });

  readonly paginatedProducts = computed(() => {
    const startIndex = (this._currentPage() - 1) * this._itemsPerPage();
    const endIndex = startIndex + this._itemsPerPage();
    return this.filteredProducts().slice(startIndex, endIndex);
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  async loadProducts(): Promise<void> {
    try {
      await this.supabaseService.getProducts();
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  async refreshProducts(): Promise<void> {
    this.productsStore.reset();
    await this.loadProducts();
  }

  // Update methods
  updateSearchTerm(term: string): void {
    this._searchTerm.set(term);
    this._currentPage.set(1); // Reset to first page
  }

  updateSelectedCategory(category: string): void {
    this._selectedCategory.set(category);
    this._currentPage.set(1); // Reset to first page
  }

  updateSortBy(sortBy: string): void {
    this._sortBy.set(sortBy);
    this._currentPage.set(1); // Reset to first page
  }

  updateCurrentPage(page: number): void {
    this._currentPage.set(page);
  }

  // Navigation methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this._currentPage.set(page);
    }
  }

  goToNextPage(): void {
    if (this._currentPage() < this.totalPages()) {
      this._currentPage.update(page => page + 1);
    }
  }

  goToPreviousPage(): void {
    if (this._currentPage() > 1) {
      this._currentPage.update(page => page - 1);
    }
  }

  // Cart methods
  addToCart(product: any): void {
    this.cartStore.addToCart(product);
  }

  // Helper methods
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this._currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total);
      }
    }
    
    return pages;
  }
} 