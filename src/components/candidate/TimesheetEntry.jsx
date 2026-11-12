
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const TimesheetEntry = () => {
  const [hours, setHours] = useState(Array(7).fill(""));
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setUserId(data.user.id);
    });
  }, []);

  const handleChange = (index, value) => {
    const newHours = [hours];
    newHours[index] = value;
    setHours(newHours);
  };

  const handleSubmit = async () => {
    await supabase.from("timesheets").insert([
      {
        candidate_id: userId,
        hours_mon: hours[0],
        hours_tue: hours[1],
        hours_wed: hours[2],
        hours_thu: hours[3],
        hours_fri: hours[4],
        hours_sat: hours[5],
        hours_sun: hours[6],
      },
    ]);
    alert("Timesheet submitted!");
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Timesheet Entry</h1>
      <form className="space-y-3">
        {days.map((day, i) => (
          <div key={i}>
            <label className="block text-sm font-medium">{day}</label>
            <input
              type="number"
              min="0"
              max="24"
              value={hours[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-full border px-3 py-1 rounded"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Submit Timesheet
        </button>
      </form>
    </div>
  );
};

export default TimesheetEntry;
