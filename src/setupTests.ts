
// This file contains setup for your tests
import '@testing-library/jest-dom';

// Import types properly - this fixes the TypeScript error
import '@types/testing-library__jest-dom';

// Set up Vitest globals
import { beforeAll, afterAll, afterEach, expect } from 'vitest';

// Silence React 18 console errors about ReactDOM.render being deprecated
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes('ReactDOM.render is no longer supported')) {
    return;
  }
  originalConsoleError(...args);
};

// Disable console logs during tests if needed
// Uncomment the lines below to disable console logs during tests
/*
if (process.env.NODE_ENV === 'test') {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
}
*/
