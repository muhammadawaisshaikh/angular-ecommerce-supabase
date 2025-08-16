import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../services/cart.store';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  private cartStore = inject(CartStore);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  // Use signals from the store
  readonly cartItems = this.cartStore.items;
  readonly subtotal = this.cartStore.total;
  
  // Computed signals for totals
  readonly shippingCost = computed(() => {
    const subtotal = this.subtotal();
    return subtotal >= 50 ? 0 : 5.99;
  });

  readonly total = computed(() => {
    const subtotal = this.subtotal();
    const shipping = this.shippingCost();
    const tax = subtotal * 0.085; // 8.5% tax
    return subtotal + shipping + tax;
  });

  readonly tax = computed(() => {
    const subtotal = this.subtotal();
    return subtotal * 0.085; // 8.5% tax
  });
  
  checkoutForm = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  };
  
  isLoading = false;
  error = '';

  ngOnInit(): void {
    // No need to calculate totals here since we're using computed signals
  }

  async placeOrder(): Promise<void> {
    if (!this.isFormValid()) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      // Create order without user authentication
      const order = {
        user_id: undefined, // Guest order - undefined instead of null
        customer_info: {
          fullName: this.checkoutForm.fullName,
          email: this.checkoutForm.email,
          phone: this.checkoutForm.phone
        },
        products: this.cartItems().map(item => ({
          product_id: item.product.id!,
          quantity: item.quantity,
          price: item.product.price
        })),
        total_amount: this.total(),
        status: 'pending' as const,
        shipping_address: `${this.checkoutForm.address}, ${this.checkoutForm.city}, ${this.checkoutForm.state} ${this.checkoutForm.zipCode}`
      };

      const createdOrder = await this.supabaseService.createOrder(order);
      if (createdOrder) {
        // Clear cart and redirect to success page
        this.cartStore.clearCart();
        this.router.navigate(['/order-success'], { 
          queryParams: { orderId: createdOrder.id } 
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      this.error = 'Failed to place order. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  isFormValid(): boolean {
    return !!(
      this.checkoutForm.fullName &&
      this.checkoutForm.email &&
      this.checkoutForm.address &&
      this.checkoutForm.city &&
      this.checkoutForm.state &&
      this.checkoutForm.zipCode
    );
  }
} 