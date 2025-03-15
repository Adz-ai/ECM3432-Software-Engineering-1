// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock for react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="map-marker" />,
  Popup: ({ children }) => <div data-testid="map-popup">{children}</div>,
  useMapEvents: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    locate: jest.fn(),
    flyTo: jest.fn(),
    getCenter: jest.fn(() => ({ lat: 50.7184, lng: -3.5339 })),
  })),
}));

// Mock for leaflet
jest.mock('leaflet', () => {
  const mockIcon = {
    Default: {
      prototype: {
        _getIconUrl: jest.fn(),
      },
      mergeOptions: jest.fn(),
    },
  };

  return {
    icon: jest.fn().mockReturnValue({}),
    divIcon: jest.fn().mockReturnValue({}),
    marker: {
      icon: jest.fn().mockReturnValue({}),
    },
    Icon: mockIcon,
    // Add any other Leaflet components you need to mock
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  // Create a mock motion function that handles both HOC pattern and direct usage
  const mockMotion = (Component) => {
    // When used as HOC: motion(Component)
    if (Component && typeof Component !== 'string') {
      return function MotionComponent(props) {
        return <Component data-testid={`motion-${Component.displayName || Component.name || 'component'}`} {...props} />;
      };
    }

    // Create predefined components for when used directly: motion.div, motion.span, etc.
    return {
      div: ({ children, ...props }) => <div data-testid="motion-div" {...props}>{children}</div>,
      span: ({ children, ...props }) => <span data-testid="motion-span" {...props}>{children}</span>,
      button: ({ children, ...props }) => <button data-testid="motion-button" {...props}>{children}</button>,
      h1: ({ children, ...props }) => <h1 data-testid="motion-h1" {...props}>{children}</h1>,
      h2: ({ children, ...props }) => <h2 data-testid="motion-h2" {...props}>{children}</h2>,
      p: ({ children, ...props }) => <p data-testid="motion-p" {...props}>{children}</p>,
      form: ({ children, ...props }) => <form data-testid="motion-form" {...props}>{children}</form>,
      img: (props) => <img data-testid="motion-img" {...props} />,
      a: ({ children, ...props }) => <a data-testid="motion-a" {...props}>{children}</a>,
    };
  };

  // Add properties to the function for direct usage
  mockMotion.div = ({ children, ...props }) => <div data-testid="motion-div" {...props}>{children}</div>;
  mockMotion.span = ({ children, ...props }) => <span data-testid="motion-span" {...props}>{children}</span>;
  mockMotion.button = ({ children, ...props }) => <button data-testid="motion-button" {...props}>{children}</button>;
  mockMotion.h1 = ({ children, ...props }) => <h1 data-testid="motion-h1" {...props}>{children}</h1>;
  mockMotion.h2 = ({ children, ...props }) => <h2 data-testid="motion-h2" {...props}>{children}</h2>;
  mockMotion.p = ({ children, ...props }) => <p data-testid="motion-p" {...props}>{children}</p>;
  mockMotion.form = ({ children, ...props }) => <form data-testid="motion-form" {...props}>{children}</form>;
  mockMotion.img = (props) => <img data-testid="motion-img" {...props} />;
  mockMotion.a = ({ children, ...props }) => <a data-testid="motion-a" {...props}>{children}</a>;

  return {
    ...actual,
    motion: mockMotion,
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Line: () => <div data-testid="chart-line" />,
  Bar: () => <div data-testid="chart-bar" />,
  Pie: () => <div data-testid="chart-pie" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="chart-tooltip" />,
  Legend: () => <div data-testid="chart-legend" />,
  Cell: () => <div data-testid="chart-cell" />,
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock console.error to avoid unnecessary React warnings in tests
const originalError = console.error;
console.error = (...args) => {
  if (
    /Warning.*not wrapped in act/i.test(args[0]) ||
    /Warning: An update to .* inside a test was not wrapped in act/i.test(args[0]) ||
    /Warning: Can't perform a React state update on an unmounted component/i.test(args[0])
  ) {
    return;
  }
  originalError(...args);
};
