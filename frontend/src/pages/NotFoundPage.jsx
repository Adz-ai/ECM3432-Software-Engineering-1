// src/pages/NotFoundPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>

      <style jsx>{`
        .not-found-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          text-align: center;
          padding: 2rem;
        }

        .not-found-content {
          max-width: 500px;
        }

        .not-found-content h1 {
          font-size: 6rem;
          color: var(--primary-color);
          margin-bottom: 0;
          opacity: 0.8;
        }

        .not-found-content h2 {
          margin-bottom: 1.5rem;
          color: var(--dark-color);
        }

        .not-found-content p {
          margin-bottom: 2rem;
          color: var(--text-muted);
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
