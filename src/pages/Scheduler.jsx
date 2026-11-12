
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isToday } from 'date-fns';

const SHIFTS = ['Morning', 'Afternoon', 'Evening'];
const MOCK_EVENTS = [
  {
    id: "evt1",
    title: "Forklift Assignment - John Smith",
    date: "2024-05-02",
    shift: "Morning",
    location: "Dallas Warehouse"
  },
  {
    id: "evt2", 
    title: "Unload Shipment - Maria Lopez",
    date: "2024-05-03",
    shift: "Evening",
    location: "Austin Distribution"
  }
];

export default function Scheduler() {
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    shift: 'Morning',
    location: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('mockScheduleEvents');
    if (!stored) {
      localStorage.setItem('mockScheduleEvents', JSON.stringify(MOCK_EVENTS));
      setEvents(MOCK_EVENTS);
    } else {
      setEvents(JSON.parse(stored));
    }
  }, []);

  const startDate = startOfWeek(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const getEventsForDay = (date) => {
    return events.filter(event => event.date === format(date, 'yyyy-MM-dd'));
  };

  const handleSave = () => {
    const newEvents = selectedEvent 
      ? events.map(e => e.id === selectedEvent.id ? { formData, id: selectedEvent.id } : e)
      : [events, { formData, id: `evt${Date.now()}` }];
    
    setEvents(newEvents);
    localStorage.setItem('mockScheduleEvents', JSON.stringify(newEvents));
    resetModal();
  };

  const handleDelete = (eventId) => {
    const newEvents = events.filter(e => e.id !== eventId);
    setEvents(newEvents);
    localStorage.setItem('mockScheduleEvents', JSON.stringify(newEvents));
  };

  const resetModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setFormData({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      shift: 'Morning',
      location: ''
    });
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setFormData(event);
    setShowModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Scheduler</h1>
        <div className="flex gap-4">
          <div className="flex rounded-lg border border-gray-200 p-1 bg-white">
            <button
              className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-blue-500 text-white' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week View
            </button>
            <button
              className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-blue-500 text-white' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month View
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Job
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => (
          <div key={idx} className="text-center text-sm font-medium">
            {format(day, 'EEE')}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-2">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`bg-white border rounded-lg p-2 min-h-[120px] ${
              isToday(day) ? 'border-blue-500' : ''
            }`}
          >
            <div className="text-right text-xs font-bold mb-2">
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {getEventsForDay(day).map(event => (
                <div
                  key={event.id}
                  className="bg-blue-50 p-2 rounded text-xs border border-blue-100"
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-gray-500">{event.shift}</div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => openEditModal(event)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {getEventsForDay(day).length === 0 && (
                <div className="text-gray-300 text-xs">No jobs</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedEvent ? 'Edit Job' : 'Add New Job'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ formData, title: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ formData, date: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shift</label>
                <select
                  value={formData.shift}
                  onChange={e => setFormData({ formData, shift: e.target.value })}
                  className="w-full border rounded p-2"
                >
                  {SHIFTS.map(shift => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ formData, location: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={resetModal}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {selectedEvent ? 'Update' : 'Add'} Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
