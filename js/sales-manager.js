
// Mock data for sales manager dashboard
const teamActivity = {
    activeLeads: 24,
    newLeadsToday: 5,
    jobOrdersSubmitted: 8,
    pendingPlacements: 12
};

const salesRepPipelines = [
    { name: "Alex Chen", leads: 8, jobOrders: 3, pendingValue: "$45,000" },
    { name: "Sarah Johnson", leads: 6, jobOrders: 2, pendingValue: "$32,000" },
    { name: "Mike Rodriguez", leads: 10, jobOrders: 4, pendingValue: "$58,000" }
];

const topPerformers = [
    { name: "Mike Rodriguez", metric: "Most New Leads", value: "10 leads" },
    { name: "Alex Chen", metric: "Highest Conversion Rate", value: "42%" },
    { name: "Sarah Johnson", metric: "Fastest Time to Close", value: "5.2 days" }
];

window.onload = () => {
    const activityList = document.getElementById("activityList");
    Object.entries(teamActivity).forEach(([key, value]) => {
        const li = document.createElement("li");
        li.innerHTML = `${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: <strong>${value}</strong>`;
        activityList.appendChild(li);
    });

    const pipelineList = document.getElementById("pipelineList");
    salesRepPipelines.forEach(rep => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${rep.name}</strong><br>
            Active Leads: ${rep.leads}<br>
            Job Orders: ${rep.jobOrders}<br>
            Pipeline Value: ${rep.pendingValue}`;
        pipelineList.appendChild(li);
    });

    const topRepsList = document.getElementById("topReps");
    topPerformers.forEach(rep => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${rep.name}</strong> - ${rep.metric}: ${rep.value}`;
        topRepsList.appendChild(li);
    });
};
