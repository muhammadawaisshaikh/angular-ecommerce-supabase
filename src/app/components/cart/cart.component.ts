import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../services/cart.store';
import { computed } from '@angular/core';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  private cartStore = inject(CartStore);

  // Use signals from the store
  readonly cartItems = this.cartStore.items;
  readonly subtotal = this.cartStore.total;
  readonly totalItems = this.cartStore.itemCount;
  readonly isEmpty = this.cartStore.isEmpty;

  // Computed signals for cart totals
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

  updateQuantity(productId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const quantity = parseInt(select.value);
    this.cartStore.updateQuantity(productId, quantity);
  }

  removeFromCart(productId: string): void {
    this.cartStore.removeFromCart(productId);
  }

  proceedToCheckout(): void {
    // Navigate to checkout page
    // The routerLink in the template will handle this
  }
} 