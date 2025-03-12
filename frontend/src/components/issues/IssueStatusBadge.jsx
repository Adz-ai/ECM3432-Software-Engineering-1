// src/components/issues/IssueStatusBadge.jsx

import React from 'react';

/**
 * Component to display the status of an issue with appropriate styling
 * @param {Object} props
 * @param {string} props.status - The issue status (NEW, IN_PROGRESS, RESOLVED)
 */
const IssueStatusBadge = ({ status }) => {
  const getStatusClassName = () => {
    switch (status) {
      case 'NEW':
        return 'status-new';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'RESOLVED':
        return 'status-resolved';
      default:
        return '';
    }
  };

  const getDisplayText = () => {
    switch (status) {
      case 'NEW':
        return 'New';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'RESOLVED':
        return 'Resolved';
      default:
        return status;
    }
  };

  return (
    <span className={`status-badge ${getStatusClassName()}`}>
      {getDisplayText()}
    </span>
  );
};

export default IssueStatusBadge;
