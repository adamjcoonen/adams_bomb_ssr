import { TestBed } from '@angular/core/testing';

import { googleOAuthService } from './googleOAuth.service';

describe('googleOAuthService', () => {
  let service: googleOAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(googleOAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
