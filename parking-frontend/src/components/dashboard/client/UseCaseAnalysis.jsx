import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const UseCaseAnalysis = ({ useCaseData }) => {
  if (!useCaseData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading use case analysis...</p>
        </div>
      </div>
    );
  }

  const { actors, useCases, systemMetrics } = useCaseData;

  // Calculate success rates for use cases
  const useCaseSuccessRates = useCases.map(useCase => ({
    ...useCase,
    successRate: ((useCase.success / (useCase.success + useCase.failed)) * 100).toFixed(1)
  }));

  // Prepare actor performance data
  const actorPerformanceData = actors.map(actor => ({
    name: actor.name.split(' ')[0], // Shortened for chart
    fullName: actor.name,
    interactions: actor.totalInteractions,
    completion: actor.completionRate,
    sessionMinutes: parseInt(actor.avgSessionTime)
  }));

  const getActorColor = (actorName) => {
    const colors = {
      'Parking Customer': '#3B82F6',
      'Parking Attendant': '#10B981', 
      'System Administrator': '#8B5CF6'
    };
    return colors[actorName] || '#6B7280';
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 95) return 'text-green-600 bg-green-100';
    if (rate >= 85) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Use Case Analysis Dashboard</h3>
        <div className="text-sm text-gray-500">
          Real-time system interaction analytics
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-green-600">{systemMetrics.uptime}%</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-blue-600">{systemMetrics.responseTime}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-2xl font-bold text-orange-600">{systemMetrics.errorRate}%</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">User Satisfaction</p>
              <p className="text-2xl font-bold text-purple-600">{systemMetrics.userSatisfaction}/5</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Actor Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Actor Interaction Volume</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={actorPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'interactions') return [value, 'Total Interactions'];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const actor = actorPerformanceData.find(a => a.name === label);
                  return actor ? actor.fullName : label;
                }}
              />
              <Bar 
                dataKey="interactions" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Actor Completion Rates</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={actorPerformanceData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="completion"
                nameKey="fullName"
                label={({ name, value }) => `${name.split(' ')[0]}: ${value}%`}
              >
                {actorPerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getActorColor(entry.fullName)} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Use Case Success Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Use Case Performance Matrix</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Use Case</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Success</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {useCaseSuccessRates.map((useCase, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {useCase.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-medium">
                    {useCase.success}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-medium">
                    {useCase.failed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSuccessRateColor(parseFloat(useCase.successRate))}`}>
                      {useCase.successRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                    {useCase.avgTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {parseFloat(useCase.successRate) >= 95 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Excellent
                      </span>
                    ) : parseFloat(useCase.successRate) >= 85 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Good
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Needs Attention
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actor Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actors.map((actor, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div 
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: getActorColor(actor.name) }}
              ></div>
              <h5 className="font-medium text-gray-900">{actor.name}</h5>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Interactions:</span>
                <span className="text-sm font-medium">{actor.totalInteractions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Users:</span>
                <span className="text-sm font-medium">{actor.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Session:</span>
                <span className="text-sm font-medium">{actor.avgSessionTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completion Rate:</span>
                <span className={`text-sm font-medium ${
                  actor.completionRate >= 95 ? 'text-green-600' : 
                  actor.completionRate >= 85 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {actor.completionRate}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-blue-900 mb-4">📊 System Optimization Recommendations</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-blue-800 mb-2">High Priority Actions:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              {useCaseSuccessRates
                .filter(uc => parseFloat(uc.successRate) < 85)
                .map((uc, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Improve "{uc.name}" success rate ({uc.successRate}%)
                  </li>
                ))}
              {systemMetrics.errorRate > 1 && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Reduce system error rate (currently {systemMetrics.errorRate}%)
                </li>
              )}
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 mb-2">Performance Insights:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Peak usage: {actorPerformanceData[0]?.name} actors ({actorPerformanceData[0]?.interactions} interactions)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                System uptime: {systemMetrics.uptime}% (Excellent)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                User satisfaction: {systemMetrics.userSatisfaction}/5 stars
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UseCaseAnalysis;