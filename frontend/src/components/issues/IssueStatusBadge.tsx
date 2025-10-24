// src/components/issues/IssueStatusBadge.tsx

import React from 'react';
import { IssueStatus } from '../../utils/constants';

interface IssueStatusBadgeProps {
  status: IssueStatus;
}

/**
 * Component to display the status of an issue with appropriate styling
 */
const IssueStatusBadge: React.FC<IssueStatusBadgeProps> = ({ status }) => {
  const getStatusClassName = (): string => {
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

  const getDisplayText = (): string => {
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
