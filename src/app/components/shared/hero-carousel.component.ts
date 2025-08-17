import { Component, OnInit, OnDestroy, inject, input, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface CarouselSlide {
  imageUrl: string;
  altText: string;
  link?: string;
  title?: string;
}

/**
 * Hero Carousel Component
 * 
 * A configurable image carousel with auto-play, navigation controls, and customizable overlay content.
 * 
 * @example
 * ```html
 * <!-- Basic usage -->
 * <app-hero-carousel></app-hero-carousel>
 * 
 * <!-- Customized usage -->
 * <app-hero-carousel 
 *   [showNavigationButtons]="false"
 *   [showContentOverlay]="true"
 *   [autoPlayInterval]="3000"
 *   [carouselHeight]="'h-64'">
 * </app-hero-carousel>
 * ```
 */
@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-carousel.component.html',
  styleUrls: ['./hero-carousel.component.scss']
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  /**
   * Controls the visibility of left/right navigation buttons
   * @default true
   */
  showNavigationButtons = input<boolean>(true);
  
  /**
   * Controls the visibility of content overlay (title and button) on slides
   * @default true
   */
  showContentOverlay = input<boolean>(true);
  
  /**
   * Controls the visibility of navigation dots at the bottom
   * @default true
   */
  showDots = input<boolean>(true);
  
  /**
   * Controls the visibility of the auto-play indicator
   * @default true
   */
  showAutoPlayIndicator = input<boolean>(true);
  
  /**
   * Auto-play interval in milliseconds
   * @default 5000
   */
  autoPlayInterval = input<number>(5000);
  
  /**
   * CSS classes for carousel height (e.g., 'h-64', 'h-96 md:h-[500px]')
   * @default 'h-96 md:h-[500px] lg:h-[600px]'
   */
  carouselHeight = input<string>('h-96 md:h-[500px] lg:h-[600px]');
  
  /**
   * Slide transition duration in milliseconds
   * @default 700
   */
  transitionDuration = input<number>(700);
  
  /**
   * Enables/disables auto-play pause on hover
   * @default true
   */
  enableHoverPause = input<boolean>(true);

  /**
   * Custom slides to override default slides
   * @default undefined (uses built-in slides)
   */
  customSlides = input<CarouselSlide[] | undefined>(undefined);

  // Carousel state
  currentSlide = 0;
  totalSlides = 0;
  private autoPlayTimer: any;

  // Default slides configuration
  private defaultSlides: CarouselSlide[] = [
    {
      imageUrl: 'https://zerolifestyle.co/cdn/shop/files/Banner_01.png?v=1736493093&width=2600',
      altText: 'Welcome to eStore - Discover amazing products',
      link: '/products',
      title: 'Shop Now'
    },
    {
      imageUrl: 'https://www.business.maxis.com.my/content/dam/enterprise/images/campaign/iphone-series/iphone16/herobanner-mobile-2x.webp',
      altText: 'Premium Quality Products',
      link: '/products',
      title: 'Explore Collection'
    },
    {
      imageUrl: 'https://i0.wp.com/blog.ugreen.com/wp-content/uploads/2020/10/iphone-12-banner-1.png?fit=1140%2C680&ssl=1',
      altText: 'Smart Shopping Experience',
      link: '/products',
      title: 'Start Shopping'
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop',
      altText: 'Special Offers and Deals',
      link: '/cart',
      title: 'View Cart'
    }
  ];

  // Computed signal for slides - uses custom slides if provided, otherwise defaults
  readonly slides = computed(() => {
    return this.customSlides() || this.defaultSlides;
  });

  constructor() {
    // Effect to automatically update totalSlides when slides change
    effect(() => {
      this.totalSlides = this.slides().length;
      // Reset current slide if it's out of bounds
      if (this.currentSlide >= this.totalSlides) {
        this.currentSlide = 0;
      }
    });
  }

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  // Carousel methods
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  previousSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
  }

  goToSlide(slideIndex: number): void {
    this.currentSlide = slideIndex;
  }

  startAutoPlay(): void {
    this.autoPlayTimer = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayInterval()); // Call the signal function to get the value
  }

  stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }

  // Pause auto-play on hover
  onCarouselHover(): void {
    if (this.enableHoverPause()) { // Call the signal function to get the value
      this.stopAutoPlay();
    }
  }

  // Resume auto-play when leaving
  onCarouselLeave(): void {
    if (this.enableHoverPause()) { // Call the signal function to get the value
      this.startAutoPlay();
    }
  }

  // Get current slide
  getCurrentSlide(): CarouselSlide {
    return this.slides()[this.currentSlide];
  }

  // Check if slide is active
  isSlideActive(slideIndex: number): boolean {
    return this.currentSlide === slideIndex;
  }
} 