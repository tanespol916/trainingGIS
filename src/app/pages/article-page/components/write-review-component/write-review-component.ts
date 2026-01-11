import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { Review } from '../review-item-component/types';
import { ArticleService } from '../../article-service';
import { catchError, EMPTY, finalize, tap } from 'rxjs';

@Component({
  selector: 'app-write-review-component',
  imports: [ButtonModule,
    DialogModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    FormsModule
  ],
  templateUrl: './write-review-component.html',
  styleUrl: './write-review-component.css',
})
export class WriteReviewComponent {
  visible = signal(false);
  @Output() reviewSubmitted = new EventEmitter<void>();

  isSubmitting = false;
  private readonly articleService = inject(ArticleService);

  review: Review = {
    username: '',
    rating: 0,
    comment: '',
  };

  showReviewDialog() {
    this.visible.set(true);
  }

  hideDialog() {
    this.visible.set(false);
  }

  submitReview() {
    this.isSubmitting = true;
    this.articleService.insertReview(this.review).pipe(
      tap(() => {
        // Case Success
        this.review = {
          username: '',
          rating: 0,
          comment: '',
        }
        
        // 🔥 emit event เมื่อ insert สำเร็จ
        this.reviewSubmitted.emit();
        this.hideDialog();
      }),
      catchError(err => {
        // Case Error
        console.log('err', err);
        return EMPTY;
      }),
      finalize(() => this.isSubmitting = false)
    ).subscribe();
  }
}
