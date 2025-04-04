
import { useEffect } from 'react';
import RunTests from '../runTests';

const TestRunnerPage = () => {
  useEffect(() => {
    document.title = 'Test Runner - JobSprints';
  }, []);
  
  return <RunTests />;
};

export default TestRunnerPage;
