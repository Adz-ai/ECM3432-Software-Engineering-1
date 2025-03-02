// src/components/common/Loader.jsx

import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      <p className="loader-message">{message}</p>
      <style jsx>{`
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .loader {
          border: 5px solid #f3f3f3;
          border-top: 5px solid #0056b3;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loader-message {
          font-size: 1.2rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Loader;
