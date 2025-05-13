import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCallbackViewComponent } from './auth-callback-view.component';

describe('AuthCallbackViewComponent', () => {
  let component: AuthCallbackViewComponent;
  let fixture: ComponentFixture<AuthCallbackViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthCallbackViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthCallbackViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
