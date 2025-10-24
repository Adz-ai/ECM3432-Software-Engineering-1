// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock for react-leaflet
vi.mock('react-leaflet', () => {
  const React = require('react');
  return {
    MapContainer: ({ children }: any) => React.createElement('div', { 'data-testid': 'map-container' }, children),
    TileLayer: () => React.createElement('div', { 'data-testid': 'tile-layer' }),
    Marker: () => React.createElement('div', { 'data-testid': 'map-marker' }),
    Popup: ({ children }: any) => React.createElement('div', { 'data-testid': 'map-popup' }, children),
    useMapEvents: vi.fn(() => ({
      on: vi.fn(),
      off: vi.fn(),
      locate: vi.fn(),
      flyTo: vi.fn(),
      getCenter: vi.fn(() => ({ lat: 50.7184, lng: -3.5339 })),
    })),
  };
});

// Mock for leaflet
vi.mock('leaflet', () => {
  const mockIcon = {
    Default: {
      prototype: {
        _getIconUrl: vi.fn(),
      },
      mergeOptions: vi.fn(),
    },
  };

  const mockLeaflet = {
    icon: vi.fn().mockReturnValue({}),
    divIcon: vi.fn().mockReturnValue({}),
    marker: {
      icon: vi.fn().mockReturnValue({}),
    },
    Icon: mockIcon,
    // Add any other Leaflet components you need to mock
  };

  return {
    default: mockLeaflet,
    ...mockLeaflet,
  };
});

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const React = require('react');
  const actual = await import('framer-motion');

  // Create a mock motion function that handles both HOC pattern and direct usage
  const mockMotion: any = (Component: any) => {
    // When used as HOC: motion(Component)
    if (Component && typeof Component !== 'string') {
      return function MotionComponent(props: any) {
        return React.createElement(Component, {
          'data-testid': `motion-${Component.displayName || Component.name || 'component'}`,
          ...props
        });
      };
    }

    // Create predefined components for when used directly: motion.div, motion.span, etc.
    return {
      div: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'motion-div', ...props }, children),
      span: ({ children, ...props }: any) => React.createElement('span', { 'data-testid': 'motion-span', ...props }, children),
      button: ({ children, ...props }: any) => React.createElement('button', { 'data-testid': 'motion-button', ...props }, children),
      h1: ({ children, ...props }: any) => React.createElement('h1', { 'data-testid': 'motion-h1', ...props }, children),
      h2: ({ children, ...props }: any) => React.createElement('h2', { 'data-testid': 'motion-h2', ...props }, children),
      p: ({ children, ...props }: any) => React.createElement('p', { 'data-testid': 'motion-p', ...props }, children),
      form: ({ children, ...props }: any) => React.createElement('form', { 'data-testid': 'motion-form', ...props }, children),
      img: (props: any) => React.createElement('img', { 'data-testid': 'motion-img', ...props }),
      a: ({ children, ...props }: any) => React.createElement('a', { 'data-testid': 'motion-a', ...props }, children),
    };
  };

  // Add properties to the function for direct usage
  mockMotion.div = ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'motion-div', ...props }, children);
  mockMotion.span = ({ children, ...props }: any) => React.createElement('span', { 'data-testid': 'motion-span', ...props }, children);
  mockMotion.button = ({ children, ...props }: any) => React.createElement('button', { 'data-testid': 'motion-button', ...props }, children);
  mockMotion.h1 = ({ children, ...props }: any) => React.createElement('h1', { 'data-testid': 'motion-h1', ...props }, children);
  mockMotion.h2 = ({ children, ...props }: any) => React.createElement('h2', { 'data-testid': 'motion-h2', ...props }, children);
  mockMotion.p = ({ children, ...props }: any) => React.createElement('p', { 'data-testid': 'motion-p', ...props }, children);
  mockMotion.form = ({ children, ...props }: any) => React.createElement('form', { 'data-testid': 'motion-form', ...props }, children);
  mockMotion.img = (props: any) => React.createElement('img', { 'data-testid': 'motion-img', ...props });
  mockMotion.a = ({ children, ...props }: any) => React.createElement('a', { 'data-testid': 'motion-a', ...props }, children);

  return {
    ...actual,
    motion: mockMotion,
    AnimatePresence: ({ children }: any) => children,
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Recharts
vi.mock('recharts', () => {
  const React = require('react');
  return {
    ResponsiveContainer: ({ children }: any) => React.createElement('div', { 'data-testid': 'responsive-container' }, children),
    LineChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'line-chart' }, children),
    BarChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'bar-chart' }, children),
    PieChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'pie-chart' }, children),
    Line: () => React.createElement('div', { 'data-testid': 'chart-line' }),
    Bar: () => React.createElement('div', { 'data-testid': 'chart-bar' }),
    Pie: () => React.createElement('div', { 'data-testid': 'chart-pie' }),
    XAxis: () => React.createElement('div', { 'data-testid': 'x-axis' }),
    YAxis: () => React.createElement('div', { 'data-testid': 'y-axis' }),
    CartesianGrid: () => React.createElement('div', { 'data-testid': 'cartesian-grid' }),
    Tooltip: () => React.createElement('div', { 'data-testid': 'chart-tooltip' }),
    Legend: () => React.createElement('div', { 'data-testid': 'chart-legend' }),
    Cell: () => React.createElement('div', { 'data-testid': 'chart-cell' }),
  };
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: any;

  constructor(callback: any) {
    this.callback = callback;
  }

  observe() {}
  unobserve() {}
  disconnect() {}
}

(window as any).IntersectionObserver = MockIntersectionObserver;

// Mock console.error to avoid unnecessary React warnings in tests
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (/Warning.*not wrapped in act/i.test(args[0]) ||
    /Warning: An update to .* inside a test was not wrapped in act/i.test(args[0]) ||
    /Warning: Can't perform a React state update on an unmounted component/i.test(args[0]))
  ) {
    return;
  }
  originalError(...args);
};
