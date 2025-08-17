import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Target } from 'lucide-react';

const TaskDistributionChart = ({ tasks }) => {
  // Status distribution data
  const statusData = [
    { 
      name: 'To Do', 
      value: tasks.filter(task => task.status === 'todo').length, 
      color: '#9CA3AF' 
    },
    { 
      name: 'In Progress', 
      value: tasks.filter(task => task.status === 'inprogress').length, 
      color: '#3B82F6' 
    },
    { 
      name: 'Review', 
      value: tasks.filter(task => task.status === 'review').length, 
      color: '#F59E0B' 
    },
    { 
      name: 'Done', 
      value: tasks.filter(task => task.status === 'done').length, 
      color: '#10B981' 
    }
  ].filter(item => item.value > 0);

  // Priority distribution data
  const priorityData = [
    { 
      name: 'High', 
      value: tasks.filter(task => task.priority === 'high').length, 
      color: '#EF4444' 
    },
    { 
      name: 'Medium', 
      value: tasks.filter(task => task.priority === 'medium').length, 
      color: '#F59E0B' 
    },
    { 
      name: 'Low', 
      value: tasks.filter(task => task.priority === 'low').length, 
      color: '#10B981' 
    }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} task{payload[0].value !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-500">
            {((payload[0].value / tasks.length) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No tasks to display</p>
        <p className="text-sm text-gray-500">Create some tasks to see the distribution</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Task Status Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Priority Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8884d8">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-900">
            {tasks.length}
          </div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {tasks.filter(task => task.status === 'done').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {tasks.filter(task => task.status === 'inprogress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">
            {tasks.filter(task => 
              task.status !== 'done' && 
              task.due_date && 
              new Date(task.due_date) < new Date()
            ).length}
          </div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>
    </div>
  );
};

export default TaskDistributionChart;