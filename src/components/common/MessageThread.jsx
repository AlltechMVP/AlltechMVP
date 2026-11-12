
import React, { useState } from 'react';

export default function MessageThread({ messages = [], applicationId }) {
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    const updated = applications.map(app => {
      if (app.jobId === applicationId) {
        return {
          app,
          messages: [(app.messages || []), {
            from: 'candidate',
            text: newMessage,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return app;
    });

    localStorage.setItem('appliedJobs', JSON.stringify(updated));
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.from === 'recruiter' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.from === 'recruiter'
                  ? 'bg-gray-100'
                  : 'bg-blue-100'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <span className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 px-4 py-2 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
