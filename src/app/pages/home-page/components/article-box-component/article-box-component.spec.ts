import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleBoxComponent } from './article-box-component';

describe('ArticleBoxComponent', () => {
  let component: ArticleBoxComponent;
  let fixture: ComponentFixture<ArticleBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleBoxComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
