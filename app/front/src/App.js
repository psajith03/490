import React, { useState } from 'react';
import './App.css';
import GlowingButton from './components/GlowingButton';
import TerminalLoader from './components/TerminalLoader';

function App() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        <GlowingButton text="Coming Soon" onClick={handleClick} />
      </header>
      
      {}
      {isLoading && (
        <div className="overlay">
          <TerminalLoader />
        </div>
      )}
    </div>
  );
}

export default App;
