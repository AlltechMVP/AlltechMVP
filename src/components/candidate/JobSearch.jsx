
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user?.id) setUserId(auth.user.id);
      const { data } = await supabase.from("jobs").select("*");
      setJobs(data || []);
    };
    load();
  }, []);

  const handleApply = async (jobId) => {
    if (!userId) return alert("User not authenticated");
    await supabase.from("applications").insert([{ candidate_id: userId, job_id: jobId }]);
    alert("Applied!");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Job Listings</h1>
      <ul className="space-y-4">
        {jobs.map((job) => (
          <li key={job.id} className="p-4 border rounded shadow">
            <h2 className="text-lg font-semibold">{job.title}</h2>
            <p>{job.description}</p>
            <p className="text-sm text-gray-600">{job.location}</p>
            <button
              onClick={() => handleApply(job.id)}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
            >
              Apply
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobSearch;
