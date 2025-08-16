import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Product, Order } from '../../services/supabase.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalSales: 0,
    activeOrders: 0,
    totalProducts: 0,
    topSellingProducts: [] as Product[],
    totalCustomers: 0
  };
  recentOrders: Order[] = [];
  showAddProductModal = false;
  newProduct = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    image_url: ''
  };

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    await this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    try {
      const [dashboardStats, orders] = await Promise.all([
        this.supabaseService.getDashboardStats(),
        this.supabaseService.getOrders()
      ]);

      this.stats = {
        ...dashboardStats,
        totalCustomers: orders.length > 0 ? new Set(orders.map(o => o.user_id)).size : 0
      };

      this.recentOrders = orders.slice(0, 10); // Show last 10 orders
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  async refreshData(): Promise<void> {
    await this.loadDashboardData();
  }

  async updateOrderStatus(orderId: string, event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as Order['status'];
    
    try {
      await this.supabaseService.updateOrderStatus(orderId, newStatus);
      await this.loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }

  async addProduct(): Promise<void> {
    try {
      const product = await this.supabaseService.createProduct(this.newProduct);
      if (product) {
        this.showAddProductModal = false;
        this.resetNewProductForm();
        await this.loadDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  }

  resetNewProductForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      image_url: ''
    };
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
} 