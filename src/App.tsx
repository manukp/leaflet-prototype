import { useState, useCallback, useRef } from 'react';
import { AppProvider } from './context/AppContext';
import { PasswordGate } from './components/PasswordGate/PasswordGate';
import { OptionsPanel } from './components/OptionsPanel/OptionsPanel';
import { MapPanel } from './components/MapPanel/MapPanel';
import { TimelineControls } from './components/TimelineControls/TimelineControls';
import { NetworkGraph } from './components/NetworkGraph/NetworkGraph';
import './App.css';

function AppContent() {
  const [panel3Width, setPanel3Width] = useState(350);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLElement>(null);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;

    // Constrain width between 200 and 600 pixels
    const constrainedWidth = Math.max(200, Math.min(600, newWidth));
    setPanel3Width(constrainedWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  return (
    <div
      className="app"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <header className="app-header">
        <h1>Investigative Visualization Tool</h1>
      </header>
      <main className="app-main" ref={containerRef}>
        <div className="panel panel-1">
          <OptionsPanel />
        </div>
        <div className="panel panel-2">
          <div className="panel-2a">
            <MapPanel />
          </div>
          <div className="panel-2b">
            <TimelineControls />
          </div>
        </div>
        <div
          className="resize-handle"
          onMouseDown={handleMouseDown}
        >
          <div className="resize-handle-bar" />
        </div>
        <div className="panel panel-3" style={{ width: panel3Width }}>
          <NetworkGraph />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <PasswordGate>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </PasswordGate>
  );
}

export default App;
