import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  subtotal = 0;
  shippingCost = 0;
  tax = 0;
  total = 0;
  
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

  constructor(
    private cartService: CartService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
    });
  }

  calculateTotals(): void {
    this.subtotal = this.cartService.getCartTotal();
    this.shippingCost = this.subtotal >= 50 ? 0 : 5.99;
    this.tax = this.subtotal * 0.085; // 8.5% tax
    this.total = this.subtotal + this.shippingCost + this.tax;
  }

  async placeOrder(): Promise<void> {
    if (!this.isFormValid()) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const currentUser = this.supabaseService.getCurrentUserValue();
      if (!currentUser) {
        this.router.navigate(['/login']);
        return;
      }

      const order = {
        user_id: currentUser.id,
        products: this.cartItems.map(item => ({
          product_id: item.product.id!,
          quantity: item.quantity,
          price: item.product.price
        })),
        total_amount: this.total,
        status: 'pending' as const,
        shipping_address: `${this.checkoutForm.address}, ${this.checkoutForm.city}, ${this.checkoutForm.state} ${this.checkoutForm.zipCode}`
      };

      const createdOrder = await this.supabaseService.createOrder(order);
      if (createdOrder) {
        // Clear cart and redirect to success page
        this.cartService.clearCart();
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
    return this.checkoutForm.fullName.trim() !== '' &&
           this.checkoutForm.email.trim() !== '' &&
           this.checkoutForm.address.trim() !== '' &&
           this.checkoutForm.city.trim() !== '' &&
           this.checkoutForm.state.trim() !== '' &&
           this.checkoutForm.zipCode.trim() !== '';
  }
} 