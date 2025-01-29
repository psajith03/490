import React from 'react';
import '../styles/GlowingButton.css';

const GlowingButton = ({ text, onClick }) => {
  return (
    <button className="glowing-button" onClick={onClick}>
      {text}
    </button>
  );
};

export default GlowingButton;
