
window.onload = () => {
    const recruiterStats = [
        { name: "Sarah Wilson", placements: 8, interviews: 24, submittal: "35%" },
        { name: "James Lee", placements: 6, interviews: 18, submittal: "42%" },
        { name: "Maria Garcia", placements: 7, interviews: 20, submittal: "38%" }
    ];

    const timecardIssues = [
        { employee: "John Smith", client: "ABC Logistics", issue: "Missing Monday" },
        { employee: "Lisa Brown", client: "XYZ Manufacturing", issue: "Overtime not approved" },
        { employee: "Mike Johnson", client: "FastTrack Shipping", issue: "Late submission" }
    ];

    const fillSummary = [
        { category: "Open Orders", count: 15 },
        { category: "Filled this Week", count: 8 },
        { category: "Time to Fill (avg)", count: "4.2 days" }
    ];

    const statsSection = document.getElementById("recruiterStats");
    recruiterStats.forEach(stat => {
        const li = document.createElement("li");
        li.innerHTML = `${stat.name}: ${stat.placements} placements, ${stat.interviews} interviews, ${stat.submittal} submittal rate`;
        statsSection.appendChild(li);
    });

    const alertsSection = document.getElementById("timecardAlerts");
    timecardIssues.forEach(issue => {
        const li = document.createElement("li");
        li.innerHTML = `${issue.employee} at ${issue.client} - ${issue.issue}`;
        alertsSection.appendChild(li);
    });

    const summarySection = document.getElementById("fillSummary");
    fillSummary.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `${item.category}: <strong>${item.count}</strong>`;
        summarySection.appendChild(li);
    });
};
