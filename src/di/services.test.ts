import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { addService, clearServices, getService, removeService } from './services.js';

describe('square2/di/service', () => {
  beforeEach(() => {
    clearServices();
  });

  afterAll(() => {
    clearServices();
  });

  it('should add and retrieve a service', () => {
    const testService = { name: 'TestService' };
    addService('test', testService);

    const service = getService('test');
    expect(service).toBe(testService);
  });

  it('should throw an error when retrieving a non-existent service', () => {
    expect(() => getService('nonExistent')).toThrowError('Error: Service "nonExistent" does not exist.');
  });

  it('should remove a service', () => {
    const testService = { name: 'TestService' };
    addService('test', testService);

    removeService('test');
    expect(() => getService('test')).toThrowError('Error: Service "test" does not exist.');
  });

  it('should clear all services', () => {
    const service1 = { name: 'Service1' };
    const service2 = { name: 'Service2' };

    addService('service1', service1);
    addService('service2', service2);

    clearServices();

    expect(() => getService('service1')).toThrowError('Error: Service "service1" does not exist.');
    expect(() => getService('service2')).toThrowError('Error: Service "service2" does not exist.');
  });

  it('should overwrite an existing service with the same name', () => {
    const service1 = { name: 'Service1' };
    const service2 = { name: 'Service2' };

    addService('test', service1);
    addService('test', service2);

    const service = getService('test');
    expect(service).toBe(service2);
  });
});
