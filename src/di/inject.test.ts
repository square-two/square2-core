import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { inject } from './inject.js';
import { addService, clearServices } from './services.js';

describe('di/inject', () => {
  beforeAll(() => {
    addService('testService', new TestService());
  });

  afterAll(() => {
    clearServices();
  });

  it('should inject a service into a field', () => {
    const testClass = new TestClass();

    expect(testClass.testService.testValue).toBe('this is a test');
  });

  it('should inject a service with a name', () => {
    const testClass = new TestClass();

    expect(testClass.testService.testValue).toBe('this is a test');
  });
});

class TestService {
  testValue: string;

  constructor() {
    this.testValue = 'this is a test';
  }
}

class TestClass {
  @inject()
  testService!: TestService;

  @inject('testService')
  test!: TestService;
}
