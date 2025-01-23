// src/components/IssueForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { IssueCreate } from '../types/issue';

interface IssueFormProps {
    onSubmit: (data: IssueCreate) => void;
}

export const IssueForm: React.FC<IssueFormProps> = ({ onSubmit }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<IssueCreate>();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Issue Type</label>
                <select
                    {...register('type', { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                    <option value="POTHOLE">Pothole</option>
                    <option value="STREET_LIGHT">Street Light</option>
                    <option value="GRAFFITI">Graffiti</option>
                    <option value="ANTI_SOCIAL">Anti-Social Behavior</option>
                    <option value="FLY_TIPPING">Fly Tipping</option>
                    <option value="BLOCKED_DRAIN">Blocked Drain</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    {...register('description', { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows={4}
                />
            </div>

            {/* Location picker will be integrated with the map component */}

            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
                Submit Report
            </button>
        </form>
    );
};