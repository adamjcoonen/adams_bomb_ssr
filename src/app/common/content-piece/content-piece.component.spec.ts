import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentPieceComponent } from './content-piece.component';

describe('ContentPieceComponent', () => {
  let component: ContentPieceComponent;
  let fixture: ComponentFixture<ContentPieceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentPieceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContentPieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
