// src/components/dashboard/IssueStatusChart.jsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IssueStatusChart = ({ data }) => {
  // Transform data if needed
  const chartData = data.map(item => ({
    name: item.status,
    count: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" name="Number of Issues" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IssueStatusChart;

