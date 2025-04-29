
import { useState } from "react";

function TimecardEntry() {
  const [hours, setHours] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    alert("Timecard submitted for approval.");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Weekly Timecard</h1>
      {submitted ? (
        <p className="text-green-600 font-semibold">Timecard submitted successfully!</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            Hours Worked This Week:
            <input
              type="number"
              className="w-full mt-1 p-2 border rounded"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
              min="0"
              max="84"
            />
          </label>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Submit Timecard
          </button>
        </form>
      )}
    </div>
  );
}

export default TimecardEntry;
