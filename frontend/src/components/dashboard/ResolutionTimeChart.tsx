// src/components/dashboard/ResolutionTimeChart.tsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { alpha, useTheme } from '@mui/material';

interface ResolutionTimeChartProps {
  data: Record<string, string | number>;
}

interface TooltipPayload {
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const ResolutionTimeChart: React.FC<ResolutionTimeChartProps> = ({ data }) => {
  const theme = useTheme();

  // Format data for the chart
  const formattedData = Object.entries(data || {}).filter(
    ([key]) => key !== 'OVERALL'
  ).map(([issueType, time]) => ({
    type: issueType.replace(/_/g, ' '),
    days: typeof time === 'string'
      ? parseFloat(time.split(' ')[0])
      : (typeof time === 'number' ? time : 0)
  }));

  // Sort data by resolution time (descending)
  formattedData.sort((a, b) => b.days - a.days);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          padding: '10px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[3],
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${label}`}</p>
          <p style={{ margin: 0, color: payload[0].color }}>
            {`Average Resolution: ${payload[0].value.toFixed(1)} days`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={formattedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="type" 
          angle={-45} 
          textAnchor="end" 
          height={70}
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          label={{ 
            value: 'Days', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="days" 
          name="Average Resolution Time (Days)" 
          fill={theme.palette.primary.main} 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResolutionTimeChart;
