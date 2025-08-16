import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Product } from '../../services/supabase.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  searchTerm = '';
  selectedCategory = '';
  sortBy = 'name';
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  
  // Loading and error states
  isLoading = true;
  error = '';
  hasData = false;

  constructor(
    private supabaseService: SupabaseService,
    private cartService: CartService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = '';
      
      const products = await this.supabaseService.getProducts();
      
      this.allProducts = products || [];
      
      this.hasData = this.allProducts.length > 0;
      
      if (this.hasData) {
        this.extractCategories();
        this.filterProducts();
      } else {
        this.error = 'No products found. Please check back later.';
      }
    } catch (error) {
      this.error = 'Failed to load products. Please try again.';
      this.hasData = false;
    } finally {
      this.isLoading = false;
    }
  }

  async refreshProducts(): Promise<void> {
    await this.loadProducts();
  }

  extractCategories(): void {
    const categorySet = new Set<string>();
    this.allProducts.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    this.categories = Array.from(categorySet).sort();
  }

  filterProducts(): void {
    let filtered = [...this.allProducts];

    // Apply search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        (product.category && product.category.toLowerCase().includes(search))
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    // Apply sorting
    switch (this.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    this.filteredProducts = filtered;
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    // You could add a toast notification here
  }
} 