// src/components/dashboard/TimelineChart.jsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TimelineChart = ({ data }) => {
  // Assuming data is already in the right format with date and count
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="reported"
          stroke="#8884d8"
          name="Reported Issues"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="resolved"
          stroke="#82ca9d"
          name="Resolved Issues"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TimelineChart;
