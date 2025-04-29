
import React, { useState, useEffect } from 'react';
import { notifications } from '../../src/data/notifications';

export default function NotificationCenter() {
  const [filter, setFilter] = useState("All");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);

  useEffect(() => {
    // Initialize notifications with read status
    setNotificationsList(notifications.map(n => ({...n, isRead: false})));
  }, []);

  useEffect(() => {
    setUnreadCount(notificationsList.filter(n => !n.isRead).length);
  }, [notificationsList]);

  const filtered = filter === "All" 
    ? notificationsList 
    : notificationsList.filter(n => n.type === filter);

  const toggleReadStatus = (id) => {
    setNotificationsList(notificationsList.map(n =>
      n.id === id ? {...n, isRead: !n.isRead} : n
    ));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notification Center</h1>
        <div className="bg-blue-100 px-4 py-2 rounded">
          <span className="font-semibold">{unreadCount} unread</span>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 border rounded ${filter === "All" ? "bg-blue-500 text-white" : ""}`}
          onClick={() => setFilter("All")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 border rounded ${filter === "Admin" ? "bg-blue-500 text-white" : ""}`}
          onClick={() => setFilter("Admin")}
        >
          Admin
        </button>
        <button
          className={`px-4 py-2 border rounded ${filter === "Client" ? "bg-blue-500 text-white" : ""}`}
          onClick={() => setFilter("Client")}
        >
          Client
        </button>
      </div>

      <div className="space-y-4">
        {filtered.map((notification) => (
          <div 
            key={notification.id}
            className={`p-4 rounded-lg shadow transition-all ${
              notification.isRead ? 'bg-white' : 'bg-blue-50 border-l-4 border-blue-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-lg font-semibold">{notification.title}</h2>
                <span className="text-sm text-gray-500">{notification.timestamp}</span>
              </div>
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
            <p className="mt-2 text-gray-700">{notification.message}</p>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded ${
                notification.type === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
              }`}>
                {notification.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
