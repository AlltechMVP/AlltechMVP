
import React, { useState } from 'react';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      date: '2024-03-15',
      message: 'New candidate application received for Senior Developer position',
      isRead: false
    },
    {
      id: 2,
      date: '2024-03-14',
      message: 'Interview scheduled with John Doe for Project Manager role',
      isRead: true
    },
    {
      id: 3,
      date: '2024-03-14',
      message: 'Client feedback received for submitted candidates',
      isRead: false
    },
    {
      id: 4,
      date: '2024-03-13',
      message: 'New job order posted by Tech Solutions Inc.',
      isRead: true
    },
    {
      id: 5,
      date: '2024-03-13',
      message: 'Timesheet approval pending for temporary staff',
      isRead: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleReadStatus = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id
        ? { ...notification, isRead: !notification.isRead }
        : notification
    ));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notification Center</h1>
      <div className="mb-4 bg-blue-100 p-3 rounded">
        <span className="font-semibold">{unreadCount} unread notifications</span>
      </div>
      
      <div className="space-y-4">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`p-4 rounded-lg shadow ${
              notification.isRead ? 'bg-white' : 'bg-blue-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-500">{notification.date}</span>
              <button
                onClick={() => toggleReadStatus(notification.id)}
                className={`px-3 py-1 rounded text-sm ${
                  notification.isRead
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {notification.isRead ? 'Mark Unread' : 'Mark Read'}
              </button>
            </div>
            <p className="text-gray-700">{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
