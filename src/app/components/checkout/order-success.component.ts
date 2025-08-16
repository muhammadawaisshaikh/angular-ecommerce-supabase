import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss']
})
export class OrderSuccessComponent implements OnInit {
  orderId: string = '';
  copyMessage: string = '';
  showCopyMessage = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.queryParams['orderId'] || '';
  }

  async copyOrderUrl(): Promise<void> {
    try {
      const orderUrl = `${window.location.origin}/order-success?orderId=${this.orderId}`;
      await navigator.clipboard.writeText(orderUrl);
      
      this.copyMessage = 'Order URL copied to clipboard!';
      this.showCopyMessage = true;
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        this.showCopyMessage = false;
      }, 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      this.copyMessage = 'Failed to copy. Please try again.';
      this.showCopyMessage = true;
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        this.showCopyMessage = false;
      }, 3000);
    }
  }
} 