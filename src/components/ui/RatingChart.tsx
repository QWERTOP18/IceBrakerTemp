import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { UserRatingHistory } from '../../types';

interface RatingChartProps {
  data: UserRatingHistory[];
  color?: string;
  categoryName: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
        <p className="text-sm text-gray-600">{format(parseISO(label), 'MMM d, yyyy')}</p>
        <p className="font-semibold text-indigo-600">
          Rating: {Math.round(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const RatingChart: React.FC<RatingChartProps> = ({ 
  data, 
  color = "#4f46e5", 
  categoryName 
}) => {
  // Format data for the chart
  const chartData = data.map(item => ({
    date: item.date,
    rating: item.rating
  }));

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <h3 className="text-lg font-semibold">{categoryName} Rating History</h3>
        {chartData.length > 0 && (
          <div className="text-sm text-gray-500">
            Latest: <span className="font-semibold text-indigo-600">{Math.round(chartData[chartData.length - 1].rating)}</span>
          </div>
        )}
      </div>
      <div className="card-body h-72">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis domain={['dataMin - 100', 'dataMax + 100']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rating" 
                name={`${categoryName} Rating`}
                stroke={color} 
                strokeWidth={2}
                dot={{ r: 4, fill: color, strokeWidth: 1, stroke: "white" }}
                activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: "white" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No rating history available
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingChart;