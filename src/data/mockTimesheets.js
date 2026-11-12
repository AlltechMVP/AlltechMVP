
export const defaultTimesheets = [
  {
    id: "ts001",
    candidateId: "cand123",
    candidateName: "Emily Tran",
    jobId: "job001", 
    jobTitle: "Warehouse Associate",
    date: "2025-05-01",
    clockIn: "08:00",
    breakStart: "12:00",
    breakEnd: "12:30",
    clockOut: "17:00",
    totalHours: 8.5,
    notes: "",
    status: "Submitted",
    weekId: "2025-W18"
  }
];

export const getStoredTimesheets = () => {
  return JSON.parse(localStorage.getItem("mockTimesheets") || JSON.stringify(defaultTimesheets));
};

export const saveTimesheets = (timesheets) => {
  localStorage.setItem("mockTimesheets", JSON.stringify(timesheets));
};
