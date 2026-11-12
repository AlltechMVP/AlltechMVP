
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    type: "approval",
    message: "Candidate John Smith approved by client.",
    timestamp: "2024-04-30T10:02:00Z",
    read: false
  },
  {
    id: "n2", 
    type: "reminder",
    message: "Submit timesheets by Friday 5 PM.",
    timestamp: "2024-04-29T08:00:00Z",
    read: false
  },
  {
    id: "n3",
    type: "error",
    message: "Failed to sync client data to export.",
    timestamp: "2024-04-29T07:50:00Z",
    read: true
  }
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  
  useEffect(() => {
    const stored = localStorage.getItem('mockNotifications');
    if (!stored) {
      localStorage.setItem('mockNotifications', JSON.stringify(INITIAL_NOTIFICATIONS));
      setNotifications(INITIAL_NOTIFICATIONS);
    } else {
      setNotifications(JSON.parse(stored));
    }
  }, []);

  const markAsRead = (id) => {
    const updated = notifications.map(note => 
      note.id === id ? {note, read: true} : note
    );
    setNotifications(updated);
    localStorage.setItem('mockNotifications', JSON.stringify(updated));
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'approval': return '✅';
      case 'reminder': return '🔔';
      case 'error': return '⚠️';
      default: return '📌';
    }
  };

  const getTypeBorder = (type) => {
    switch(type) {
      case 'approval': return 'border-l-green-500';
      case 'reminder': return 'border-l-yellow-500';
      case 'error': return 'border-l-red-500';
      default: return 'border-l-gray-500';
    }
  };

  const filterNotifications = () => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === activeFilter);
  };

  const FilterButton = ({ type, label }) => (
    <button
      className={`px-3 py-1 rounded ${
        activeFilter === type 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
      onClick={() => setActiveFilter(type)}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
      <div className="flex gap-2 mb-6">
        <FilterButton type="all" label="All" />
        <FilterButton type="unread" label="Unread" />
        <FilterButton type="approval" label="Approvals" />
        <FilterButton type="reminder" label="Reminders" />
        <FilterButton type="error" label="Errors" />
      </div>

      <div className="overflow-y-auto max-h-[75vh] space-y-3">
        {filterNotifications().length === 0 ? (
          <p className="text-center text-gray-400 py-8">No notifications.</p>
        ) : (
          filterNotifications().map(notification => (
            <div 
              key={notification.id}
              className={`bg-white shadow p-4 rounded border-l-4 ${getTypeBorder(notification.type)} relative ${
                notification.read ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl" role="img" aria-label={notification.type}>
                  {getTypeIcon(notification.type)}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(notification.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                  >
                    Mark as read
                  </button>
                )}
                {notification.read && (
                  <span className="text-sm text-gray-400">Read</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
