import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SegmentedNavComponent } from '../../shared/components/segmented-nav-component/segmented-nav-component';
import { ReviewItemComponent } from './components/review-item-component/review-item-component';
import { WriteReviewComponent } from './components/write-review-component/write-review-component';
import { ReviewSummaryComponent } from './components/review-summary-component/review-summary-component';
import { ReviewSummary } from './components/review-summary-component/types';
import { Review } from './components/review-item-component/types';
import { ArticleService } from './article-service';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-article-page',
  imports: [SegmentedNavComponent, ReviewItemComponent, 
  WriteReviewComponent, ReviewSummaryComponent, CommonModule, SkeletonModule ],
  templateUrl: './article-page.html',
  styleUrl: './article-page.css',
})
export class ArticlePage implements OnInit {
  private readonly articleService = inject(ArticleService);
  readonly isLoading = signal(false);
  readonly reviews = signal<Review[]>([]);
  readonly summary = computed<ReviewSummary>(() => {
    const reviews = this.reviews();
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        avgRating: 0,
        percent5Star: 0,
        percent4Star: 0,
        percent3Star: 0,
        percent2Star: 0,
        percent1Star: 0,
        totalReviews: 0,
      };
    }

    let sum = 0;
    const counts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const r of reviews) {
      sum += r.rating;
      counts[r.rating as 1 | 2 | 3 | 4 | 5]++;
    }

    return {
      avgRating: Number((sum / totalReviews).toFixed(1)),
      percent5Star: Math.round((counts[5] / totalReviews) * 100),
      percent4Star: Math.round((counts[4] / totalReviews) * 100),
      percent3Star: Math.round((counts[3] / totalReviews) * 100),
      percent2Star: Math.round((counts[2] / totalReviews) * 100),
      percent1Star: Math.round((counts[1] / totalReviews) * 100),
      totalReviews,
    };
  })

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews() {
    this.isLoading.set(true);
    this.articleService.getReviews().pipe(
      tap((reviews) => {
        this.reviews.set(reviews);
      }),
      catchError(err => {
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe();
  }
}
