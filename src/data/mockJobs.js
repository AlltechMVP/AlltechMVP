
export const mockJobs = [
  {
    id: "job001",
    title: "Warehouse Picker",
    location: "Dallas, TX",
    pay: "$17/hr",
    shift: "2nd Shift",
    description: "Pick and pack orders at large distribution center.",
    requirements: "Steel-toe boots required.",
    matchScore: 88
  },
  {
    id: "job002",
    title: "General Labor - Demolition",
    location: "Fort Worth, TX",
    pay: "$20/hr",
    shift: "1st Shift",
    description: "Assist with site cleanup and tear-down.",
    requirements: "Must lift 50+ lbs.",
    matchScore: 76
  }
];

export const calculateMatchScore = (job, candidateProfile) => {
  return 75 + Math.floor(Math.random() * 25);
};
