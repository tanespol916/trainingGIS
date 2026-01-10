import { Component , Input } from '@angular/core';
import { ReviewSummary } from './types';
import { ProgressBarModule } from 'primeng/progressbar';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-summary-component',
  imports: [ProgressBarModule,RatingModule , FormsModule , CommonModule],
  templateUrl: './review-summary-component.html',
  styleUrl: './review-summary-component.css',
})
export class ReviewSummaryComponent {
  @Input({ required: true }) summary!: ReviewSummary;

}
