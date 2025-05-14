import { TestBed } from '@angular/core/testing';

import { OpenMicsService } from './openmics.service';

describe('OpenMicsService', () => {
  let service: OpenMicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenMicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
