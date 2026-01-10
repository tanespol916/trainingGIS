import { Component } from '@angular/core';
import { SegmentedNavComponent } from '../../shared/components/segmented-nav-component/segmented-nav-component';
import { ReviewItemComponent } from './components/review-item-component/review-item-component';
import { WriteReviewComponent } from './components/write-review-component/write-review-component';

@Component({
  selector: 'app-article-page',
  imports: [SegmentedNavComponent, ReviewItemComponent, WriteReviewComponent],
  templateUrl: './article-page.html',
  styleUrl: './article-page.css',
})
export class ArticlePage {
  
}
