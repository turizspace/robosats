import React, { useState, useCallback, useRef, useEffect } from 'react';

type PerformanceBenchmarkProps = {
  children: React.ReactNode;
};

const SingleRenderBenchmark: React.FC<PerformanceBenchmarkProps> = ({ children }) => {
  const renderTime = useRef<number>(0);

  const handleRender = useCallback((id: string, phase: string, actualTime: number) => {
    if (phase === 'mount') {
      // Ignore the initial mount phase.
      return;
    }
    renderTime.current += actualTime;
  }, []);

  return (
    <>
    <div style={{ color: 'grey' }}>
      Render time: <strong>{renderTime.current.toFixed(2)} ms</strong>
    </div>
    <React.Profiler id='benchmark' onRender={handleRender}>
      {children}
    </React.Profiler>
    </>
  );
};

export const MultiRenderBenchmark: React.FC<PerformanceBenchmarkProps> = ({ children }) => {
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const [iteration, setIteration] = useState(0);
  const renderCount = useRef(0);
  const totalRenderTime = useRef(0);

  const renders = 100;

  const handleRender = useCallback((id: string, phase: string, actualTime: number) => {
    if (phase === 'mount') {
      // Ignore the initial mount phase.
      return;
    }

    totalRenderTime.current += actualTime;
    renderCount.current += 1;

    if (renderCount.current === renders) {
      const averageRenderTime = totalRenderTime.current / renders;
      setRenderTime(averageRenderTime);
    }
  }, []);

  useEffect(() => {
    if (renderCount.current < renders) {
      setTimeout(() => {
        setIteration((prevIteration) => prevIteration + 1);
      }, 0);
    }
  }, [iteration]);

  return (
    <React.Profiler id='benchmark' onRender={handleRender}>
      <div style={{ color: 'grey' }}>
        Total render time: {totalRenderTime.current} ms. Average render time ({renders} renders):{' '}
        <strong>{renderTime?.toFixed(2)} ms</strong>
      </div>
      {React.cloneElement(children, { key: iteration })}
    </React.Profiler>
  );
};

export default MultiRenderBenchmark;
