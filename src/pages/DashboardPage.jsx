import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { healthService } from '../services/healthService';

export function DashboardPage() {
  const { user, workspace, fetchWorkspace } = useAuthStore();
  const [currentDate] = useState(new Date());
  const [apiHealth, setApiHealth] = useState(null);

  useEffect(() => {
    // Fetch the current workspace on component mount
    fetchWorkspace().catch((error) => {
      console.error('Failed to fetch workspace:', error);
    });
    healthService.checkHealth()
      .then(setApiHealth)
      .catch(() => setApiHealth({ status: 'offline' }));
  }, [fetchWorkspace]);

  // These will come from backend API calls in the future
  // For now showing how the UI handles the data structure
  const dashboardStats = {
    todaysCallsWaiting: workspace?.todaysCallsWaiting || 0,
    bookedCalls: workspace?.bookedCalls || 0,
    totalCallsAttended: workspace?.totalCallsAttended || 0,
    callsCompletedPercentage: workspace?.callsCompletedPercentage || 0,
    callsNeedReview: workspace?.callsNeedReview || 0,
    articles: workspace?.articles || 0,
    criticalFails: workspace?.criticalFails || 0
  };

  // Timeline data will come from API
  const timelineData = workspace?.todaysSchedule || [];

  // Client performance data will come from API  
  const clientData = workspace?.clientPerformance || [];

  const formatDateShort = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-3 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">
              Good morning, {user?.name || 'User'}!
            </h1>
            <div className={`self-start rounded-lg border px-3 py-1.5 text-xs sm:text-sm ${apiHealth?.status === 'offline' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
              API {apiHealth?.status === 'offline' ? 'Offline' : 'Healthy'}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Call Coach 360° wishes you a good and productive day.{' '}
            <span className="text-blue-600 font-semibold">{dashboardStats.todaysCallsWaiting} calls</span> waiting for you today. You also have{' '}
            <span className="text-blue-600 font-semibold">{dashboardStats.bookedCalls} booked calls</span> in your calendar today.
          </p>
        </div>

        {/* Date and Timeline */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-xl font-semibold text-gray-900">📅 {formatDateShort(currentDate)}</h2>
              <div className="hidden sm:flex text-sm text-gray-500 gap-4">
                <span>Time</span>
                <span>Today's timeline</span>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {timelineData.length > 0 ? timelineData.map((call, index) => (
              <div key={index} className="p-3 sm:p-4 hover:bg-gray-50">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {/* Agent info row */}
                  <div className="flex items-center space-x-3">
                    <div className="text-xs font-medium text-gray-500 w-10 shrink-0">
                      {call.time}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0">
                        {call.agent?.split(' ').map(n => n[0]).join('') || 'NA'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{call.agent || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{call.phone || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Call details row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-8 pl-[52px] sm:pl-0">
                    <div>
                      <div className="text-[10px] sm:text-xs text-gray-400">📞 Call type:</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{call.callType || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-xs text-gray-400">📍 Location:</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{call.location || 'N/A'}</div>
                    </div>
                    {call.isBooked && (
                      <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium">
                        Booked Call
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500">
                <div className="text-2xl mb-2">📅</div>
                <p>No calls scheduled for today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-80 bg-white shadow-sm p-4 lg:p-6 space-y-6">
        {/* Calendar */}
        <div className="bg-pink-100 rounded-lg p-3 sm:p-4">
          <div className="text-center mb-3">
            <div className="bg-pink-400 text-white px-3 py-1 rounded-full text-sm font-medium inline-block">
              May 2025
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0 text-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="font-medium text-gray-600 p-1 text-[10px] sm:text-xs">{day}</div>
            ))}
            {[...Array(35)].map((_, i) => {
              const date = i + 1;
              const isToday = date === 15;
              const isWeekend = (i + 1) % 7 === 0 || (i + 2) % 7 === 0;
              if (date > 31) return <div key={i} className="p-1"></div>;
              return (
                <div 
                  key={i} 
                  className={`p-0.5 sm:p-1 text-[10px] sm:text-xs ${isToday ? 'bg-pink-400 text-white rounded-full' : ''} ${isWeekend ? 'text-gray-400' : 'text-gray-700'}`}
                >
                  {date <= 31 ? date : ''}
                </div>
              );
            })}
          </div>
          <div className="text-right text-[10px] sm:text-xs text-gray-500 mt-2">
            W23, W24, W25, W26
          </div>
        </div>

        {/* Today's Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Today's actions</h3>
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {dashboardStats.totalCallsAttended}
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4">00 those to move bookings</p>
          
          <div className="text-center mb-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-8 border-green-400 flex items-center justify-center">
                <div className="text-base sm:text-xl font-bold text-green-600">{dashboardStats.callsCompletedPercentage}%</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-base sm:text-lg font-bold text-gray-900">{dashboardStats.callsCompletedPercentage}% calls</div>
              <div className="text-xs text-gray-500">completed to the next step</div>
              <div className="text-xs sm:text-sm text-orange-600 font-medium">{dashboardStats.callsNeedReview} calls need review</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <button className="bg-green-500 text-white px-2.5 py-1 rounded text-[11px] sm:text-xs">Successful Calls</button>
            <button className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded text-[11px] sm:text-xs">Unsuccessful Calls</button>
            <button className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[11px] sm:text-xs">Today</button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-orange-600">{dashboardStats.articles} articles</span>
              <span className="text-red-600">{dashboardStats.criticalFails} critical fails</span>
            </div>
          </div>
        </div>

        {/* Client Performance */}
        <div>
          <div className="grid grid-cols-3 items-center mb-3 text-xs sm:text-sm gap-1">
            <span className="font-medium text-gray-900">Client Name</span>
            <span className="font-medium text-gray-900 text-center">Avg. Scr</span>
            <span className="font-medium text-gray-900 text-right">Pass %</span>
          </div>
          
          {clientData.length > 0 ? clientData.map((client, index) => (
            <div key={index} className="grid grid-cols-3 items-center py-2 border-b border-gray-100 last:border-b-0 gap-1">
              <div className="flex items-center space-x-1.5 min-w-0">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-medium shrink-0">
                  {client.name?.split(' ').map(n => n[0]).join('') || 'NA'}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 text-xs truncate">{client.name || 'N/A'}</div>
                  <div className="text-[10px] text-gray-500 truncate">{client.phone || 'N/A'}</div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium">
                  {client.avgScore || 0} avg
                </div>
              </div>
              <div className="text-xs font-medium text-gray-900 text-right">
                {client.passRate || 0}%
              </div>
            </div>
          )) : (
            <div className="text-center py-4 text-gray-500">
              <div className="text-lg mb-1">📊</div>
              <p className="text-sm">No client data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}