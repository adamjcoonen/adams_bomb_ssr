import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenMicsComponent } from './openmics.component';

describe('OpenMicsComponent', () => {
  let component: OpenMicsComponent;
  let fixture: ComponentFixture<OpenMicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenMicsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenMicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
