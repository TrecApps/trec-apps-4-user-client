import { TestBed } from '@angular/core/testing';

import { MfaService } from './mfa.service';

describe('MfaService', () => {
  let service: MfaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MfaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
