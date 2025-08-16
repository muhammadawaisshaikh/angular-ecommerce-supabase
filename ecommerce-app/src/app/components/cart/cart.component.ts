import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  subtotal = 0;
  shippingCost = 0;
  total = 0;
  totalItems = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
    });
  }

  calculateTotals(): void {
    this.subtotal = this.cartService.getCartTotal();
    this.totalItems = this.cartService.getCartItemCount();
    
    // Free shipping on orders over $50
    this.shippingCost = this.subtotal >= 50 ? 0 : 5.99;
    
    // Add tax (assuming 8.5% tax rate)
    const tax = this.subtotal * 0.085;
    this.total = this.subtotal + this.shippingCost + tax;
  }

  updateQuantity(productId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const quantity = parseInt(select.value);
    this.cartService.updateQuantity(productId, quantity);
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  proceedToCheckout(): void {
    // Navigate to checkout page
    // This would be implemented with a router navigation
    console.log('Proceeding to checkout...');
  }
} 