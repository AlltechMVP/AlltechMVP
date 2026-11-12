
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { format, startOfWeek, addDays } from 'date-fns';

const timeSlots = Array.from({ length: 10 }, (_, i) => `${i + 8}:00`);

export default function SchedulingCalendar() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('calendarAssignments') || '[]');
    setAssignments(stored);
  }, []);

  const getWeekDays = () => {
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }, (_, i) => ({
      date: addDays(start, i),
      slots: timeSlots.map(time => ({ time, assignments: [] }))
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const [sourceDay, sourceTime] = result.source.droppableId.split('-');
    const [destDay, destTime] = result.destination.droppableId.split('-');
    const assignment = assignments.find(a => a.id.toString() === result.draggableId);

    if (assignment) {
      const updatedAssignments = assignments.map(a => 
        a.id === assignment.id 
          ? { a, day: destDay, time: destTime }
          : a
      );

      setAssignments(updatedAssignments);
      localStorage.setItem('calendarAssignments', JSON.stringify(updatedAssignments));

      // Add notification
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      localStorage.setItem('notifications', JSON.stringify([
        notifications,
        {
          id: Date.now(),
          type: 'assignment',
          text: `${assignment.candidate} assigned to ${assignment.job} at ${destTime} on ${destDay}`,
          read: false,
          timestamp: new Date().toISOString()
        }
      ]));
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Weekly Schedule</h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-2">
          {getWeekDays().map(day => (
            <div key={format(day.date, 'EEEE')} className="border rounded">
              <div className="p-2 bg-gray-100 font-semibold">
                {format(day.date, 'EEEE')}
              </div>
              {timeSlots.map(time => (
                <Droppable key={time} droppableId={`${format(day.date, 'EEEE')}-${time}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {provided.droppableProps}
                      className={`p-2 border-t min-h-[60px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-white'
                      }`}
                    >
                      <div className="text-xs text-gray-500 mb-1">{time}</div>
                      {assignments
                        .filter(a => a.day === format(day.date, 'EEEE') && a.time === time)
                        .map((assignment, index) => (
                          <Draggable
                            key={assignment.id}
                            draggableId={assignment.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {provided.draggableProps}
                                {provided.dragHandleProps}
                                className="bg-blue-100 p-2 rounded mb-1 text-sm"
                              >
                                <div className="font-semibold">{assignment.job}</div>
                                <div>{assignment.candidate}</div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
