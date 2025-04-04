
import { useEffect } from 'react';
import TestRunner from '../runTests';

const TestRunnerPage = () => {
  useEffect(() => {
    document.title = 'Test Runner - JobSprints';
  }, []);
  
  return <TestRunner />;
};

export default TestRunnerPage;
