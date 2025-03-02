// src/components/dashboard/StaffPerformance.jsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StaffPerformance = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="staffName" type="category" />
        <Tooltip />
        <Legend />
        <Bar dataKey="resolved" fill="#82ca9d" name="Issues Resolved" />
        <Bar dataKey="assigned" fill="#8884d8" name="Issues Assigned" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StaffPerformance;
