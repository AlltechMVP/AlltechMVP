
import React, { useState, useEffect } from 'react';

const CANNED_ANSWERS = [
  {
    question: "How do I submit a timesheet?",
    answer: "Go to your dashboard and click 'Submit Timesheet' under your name."
  },
  {
    question: "How do I update my profile?",
    answer: "Visit the User Settings panel and save your new display name."
  },
  {
    question: "How do I change my password?",
    answer: "Go to Account Settings and select 'Change Password'."
  },
  {
    question: "Where can I see my assignments?",
    answer: "Check the Assignments tab in your dashboard for current and upcoming work."
  }
];

export default function AIAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState(CANNED_ANSWERS);

  useEffect(() => {
    if (search) {
      const filtered = CANNED_ANSWERS.filter(qa => 
        qa.question.toLowerCase().includes(search.toLowerCase()) ||
        qa.answer.toLowerCase().includes(search.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults(CANNED_ANSWERS);
    }
  }, [search]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 z-50"
      >
        <span className="sr-only">Ask AI Assistant</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold dark:text-white">AI Assistant</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <span className="sr-only">Close panel</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search for help"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {results.map((qa, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <h3 className="font-medium mb-2 dark:text-white">{qa.question}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{qa.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
