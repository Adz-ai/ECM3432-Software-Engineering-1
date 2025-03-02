// src/pages/ReportIssuePage.jsx

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import IssueForm from '../components/issues/IssueForm';

const ReportIssuePage = () => {
  const { currentUser } = useContext(AuthContext);

  // If not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: '/report' }} />;
  }

  return (
    <div className="report-issue-page">
      <div className="page-header">
        <h1>Report an Issue</h1>
        <p>Help improve your community by reporting issues you've found.</p>
      </div>

      <div className="report-instructions">
        <div className="instruction-step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Select Issue Type</h3>
            <p>Choose the category that best describes the issue you've found.</p>
          </div>
        </div>

        <div className="instruction-step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Describe the Problem</h3>
            <p>Provide as much detail as possible about the issue.</p>
          </div>
        </div>

        <div className="instruction-step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Mark the Location</h3>
            <p>Click on the map to pinpoint exactly where the issue is located.</p>
          </div>
        </div>

        <div className="instruction-step">
          <div className="step-number">4</div>
          <div className="step-content">
            <h3>Add Photos (Optional)</h3>
            <p>Upload images to help our team better understand the issue.</p>
          </div>
        </div>
      </div>

      <IssueForm />
    </div>
  );
};

export default ReportIssuePage;
