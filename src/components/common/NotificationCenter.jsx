
import React, { useState, useEffect } from 'react';
import { BsBell, BsBellFill } from 'react-icons/bs';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadNotifications = () => {
      const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
      setNotifications(stored);
      setUnreadCount(stored.filter(n => !n.read).length);
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = () => {
    const updated = notifications.map(n => ({ n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setUnreadCount(0);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        {unreadCount > 0 ? <BsBellFill className="text-blue-500" /> : <BsBell />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <button 
                onClick={markAllRead}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Mark all read
              </button>
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mt-2 w-full p-1 border rounded"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="application">Applications</option>
              <option value="message">Messages</option>
              <option value="reminder">Reminders</option>
            </select>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-3 border-b ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
              >
                <p className="text-sm">{notification.text}</p>
                <span className="text-xs text-gray-500">{notification.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
