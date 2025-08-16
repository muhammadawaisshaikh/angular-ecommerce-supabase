import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from './services/supabase.service';
import { CartService } from './services/cart.service';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  cartItemCount = 0;
  showUserMenu = false;
  isAdmin = false;

  constructor(
    private supabaseService: SupabaseService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.supabaseService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.checkAdminStatus(user.id);
      }
    });

    this.cartService.getCartItems().subscribe(items => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });
  }

  async checkAdminStatus(userId: string): Promise<void> {
    const profile = await this.supabaseService.getUserProfile(userId);
    this.isAdmin = profile?.role === 'admin';
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  async signOut(): Promise<void> {
    await this.supabaseService.signOut();
    this.showUserMenu = false;
  }
}
