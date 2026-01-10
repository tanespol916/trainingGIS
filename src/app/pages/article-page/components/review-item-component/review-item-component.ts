import { Component , Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { Review } from './types';

@Component({
  selector: 'app-review-item-component',
  imports: [AvatarModule,AvatarGroupModule,RatingModule,FormsModule],
  templateUrl: './review-item-component.html',
  styleUrl: './review-item-component.css',
})
export class ReviewItemComponent {
  @Input({ required: true }) review!: Review;
}
