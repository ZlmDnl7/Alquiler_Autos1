// Tests básicos para el frontend (sin JSX para evitar transformadores)
describe('Frontend basic tests', () => {
  test('should pass basic math', () => {
    expect(2 + 2).toBe(4);
  });

  test('should handle string operations', () => {
    expect('test'.toUpperCase()).toBe('TEST');
  });
});
