import { TestBed } from '@angular/core/testing';

import { FeaturedMediaService } from './featured-media.service';

describe('FeaturedMediaService', () => {
  let service: FeaturedMediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeaturedMediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
