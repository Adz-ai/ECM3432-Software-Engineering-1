// src/components/IssueList.tsx
import React from 'react';
import { Issue } from '../types/issue';

interface IssueListProps {
    issues: Issue[];
    onIssueSelect: (issue: Issue) => void;
}

export const IssueList: React.FC<IssueListProps> = ({ issues, onIssueSelect }) => {
    return (
        <div className="space-y-4">
            {issues.map((issue) => (
                <div
                    key={issue.id}
                    className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onIssueSelect(issue)}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-medium">{issue.type}</h3>
                            <p className="text-sm text-gray-600">{issue.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                            issue.status === 'NEW' ? 'bg-red-100 text-red-800' :
                                issue.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                    issue.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                        }`}>
              {issue.status}
            </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        Reported: {new Date(issue.createdAt).toLocaleDateString()}
                    </div>
                </div>
            ))}
        </div>
    );
};