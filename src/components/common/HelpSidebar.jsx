
import React, { useState } from "react";

const HelpSidebar = () => {
  const [open, setOpen] = useState(false);

  const articles = [
    {
      title: "How to Submit a Timesheet",
      content: "Navigate to your dashboard and click 'Enter Time'",
    },
    {
      title: "Client Approval Process",
      content: "Clients can view and approve candidates from their portal",
    },
    {
      title: "Resetting Your Password",
      content: "Click 'Forgot Password' on the login screen to begin",
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 z-40"
      >
        Help
      </button>

      {open && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 p-4 border-l">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Help Center</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            {articles.map((article, i) => (
              <div key={i}>
                <h3 className="font-semibold">{article.title}</h3>
                <p className="text-sm text-gray-600">{article.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default HelpSidebar;
