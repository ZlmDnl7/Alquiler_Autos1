// Tests básicos para el backend
const { expect } = require('@jest/globals');

describe('Backend Tests', () => {
  test('should pass basic math', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle string operations', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });

  test('should validate array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });
});
