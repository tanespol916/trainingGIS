import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { SegmentedNavComponent } from '../../shared/components/segmented-nav-component/segmented-nav-component';
import { ReviewItemComponent } from './components/review-item-component/review-item-component';
import { WriteReviewComponent } from './components/write-review-component/write-review-component';
import { ArticleService } from './article-service';
import { Review } from './components/review-item-component/types';
import { CommonModule } from '@angular/common';
import { ReviewSummaryComponent } from './components/review-summary-component/review-summary-component';
import { ReviewSummary } from './components/review-summary-component/types';
import { SkeletonModule } from 'primeng/skeleton';


@Component({
  selector: 'app-article-page',
  imports: [SegmentedNavComponent, ReviewItemComponent, WriteReviewComponent, CommonModule, ReviewSummaryComponent, SkeletonModule],
  templateUrl: './article-page.html',
  styleUrl: './article-page.css',
})
export class ArticlePage implements OnInit {

  reviews = signal<Review[]>([]);
  loadingReviews = true;

  private readonly articleService = inject(ArticleService);

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews() {
    this.articleService.getReviews().subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loadingReviews = false;
      },
      error: (err) => {
        console.log('Error loading reviews', err);
      }
    });

  }
  onReviewInserted() {
    this.loadReviews();
  }

  reviewSummary = computed<ReviewSummary>(() => {
    const list = this.reviews();
    const total = list.length;

    if (total === 0) {
      return {
        avgRating: 0,
        totalReviews: 0,
        percent5Star: 0,
        percent4Star: 0,
        percent3Star: 0,
        percent2Star: 0,
        percent1Star: 0,
      };
    }
    let sum = 0;
    const counts = [0, 0, 0, 0, 0, 0];

    for (const r of list) {
      sum += r.rating;
      counts[r.rating] = counts[r.rating] + 1;
    }

    return {
      avgRating: Number((sum / total).toFixed(1)),
      totalReviews: total,
      percent5Star: Number(((counts[5] / total) * 100).toFixed(0)),
      percent4Star: Number(((counts[4] / total) * 100).toFixed(0)),
      percent3Star: Number(((counts[3] / total) * 100).toFixed(0)),
      percent2Star: Number(((counts[2] / total) * 100).toFixed(0)),
      percent1Star: Number(((counts[1] / total) * 100).toFixed(0)),
    };

  });


}
