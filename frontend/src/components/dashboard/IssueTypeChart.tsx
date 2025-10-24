// src/components/dashboard/IssueTypeChart.tsx

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface IssueTypeData {
  type: string;
  count: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface IssueTypeChartProps {
  data: IssueTypeData[];
}

interface PieLabelProps {
  name: string;
  percent: number;
}

const IssueTypeChart: React.FC<IssueTypeChartProps> = ({ data }) => {
  // Transform data if needed
  const chartData: ChartDataItem[] = data.map((item: IssueTypeData, index: number) => ({
    name: item.type.replace('_', ' '),
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }: PieLabelProps) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry: ChartDataItem, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default IssueTypeChart;
