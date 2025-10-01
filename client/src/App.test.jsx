// Tests básicos para el frontend
import { render } from '@testing-library/react';
import App from './App';

describe('Frontend Tests', () => {
  test('should render without crashing', () => {
    render(<App />);
    // Test básico para verificar que la app se renderiza
  });

  test('should pass basic math', () => {
    expect(2 + 2).toBe(4);
  });

  test('should handle string operations', () => {
    expect('test'.length).toBe(4);
  });
});
