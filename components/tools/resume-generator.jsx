
import React, { useState } from "react";

export default function ResumeGenerator() {
  const [form, setForm] = useState({
    name: "",
    summary: "",
    skills: "",
    experience: "",
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Resume Generator</h1>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block mb-1">Full Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Professional Summary</label>
          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Skills</label>
          <textarea
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="Separated by commas"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Experience</label>
          <textarea
            name="experience"
            value={form.experience}
            onChange={handleChange}
            rows="4"
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-white shadow">
        <h2 className="text-xl font-bold mb-4">Generated Resume</h2>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-center">{form.name}</h3>
          <div>
            <h4 className="font-semibold mb-2">Professional Summary</h4>
            <p className="text-gray-700">{form.summary}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Skills</h4>
            <p className="text-gray-700">{form.skills}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Experience</h4>
            <p className="text-gray-700 whitespace-pre-line">{form.experience}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
