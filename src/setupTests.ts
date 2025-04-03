
// This file contains setup for your tests
// You can add global mocks, polyfills, or other setup code here

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
