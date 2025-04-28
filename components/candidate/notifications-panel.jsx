
import React from 'react';

export default function NotificationsPanel() {
  const mockNotifications = [
    {
      id: 1,
      date: '2024-02-20',
      message: 'Your timesheet has been approved'
    },
    {
      id: 2,
      date: '2024-02-19',
      message: 'New job matching your profile available'
    },
    {
      id: 3,
      date: '2024-02-18',
      message: 'Please complete your pending onboarding documents'
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      <div className="space-y-3">
        {mockNotifications.map(notification => (
          <div key={notification.id} className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">{notification.date}</div>
            <div className="mt-1">{notification.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
