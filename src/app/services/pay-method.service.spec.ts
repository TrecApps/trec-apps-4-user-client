import { TestBed } from '@angular/core/testing';

import { PayMethodService } from './pay-method.service';

describe('PayMethodService', () => {
  let service: PayMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
