import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Review } from './components/review-item-component/types';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly API_URL = 'https://jatagrhqdlontuggfkii.supabase.co/rest/v1/Reviews';
  private readonly API_KEY = 'sb_publishable_R8SVbRqDFTzyqTRPXSgfGg_DBOVOGHW';

  private readonly headers = new HttpHeaders({
    apikey: this.API_KEY,
    Authorization: `Bearer ${this.API_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  });
  
  private readonly http = inject(HttpClient);
    
  insertReview(review: Review): Observable<any> {
    return this.http.post(this.API_URL, review, {
      headers: this.headers,
    });
  }
}
