
window.onload = () => {
    const kpis = [
        { label: "Avg Fill Rate", value: "84%" },
        { label: "Avg Time-to-Fill", value: "3.4 days" },
        { label: "Gross Margin", value: "39%" },
        { label: "Placement Velocity", value: "2.1 placements/rep/week" }
    ];

    const automation = [
        { label: "Digital Onboarding Rate", value: "92%" },
        { label: "AI Resume Generator Usage", value: "68%" },
        { label: "Automated Timecard Compliance", value: "87%" }
    ];

    const risks = [
        "High turnover at North Branch (27% last 30 days)",
        "Client ghosting at Tesla (3 rejected, 0 response)",
        "Manual payroll override detected in 12 cases last week"
    ];

    const branches = [
        { branch: "East Branch", result: "Top performer – 43 placements, 91% margin" },
        { branch: "North Branch", result: "Low performer – 22 placements, high churn" }
    ];

    const kpiList = document.getElementById("kpiList");
    kpis.forEach(k => {
        const li = document.createElement("li");
        li.innerText = `${k.label}: ${k.value}`;
        kpiList.appendChild(li);
    });

    const automationList = document.getElementById("automationList");
    automation.forEach(a => {
        const li = document.createElement("li");
        li.innerText = `${a.label}: ${a.value}`;
        automationList.appendChild(li);
    });

    const riskList = document.getElementById("riskAlerts");
    risks.forEach(r => {
        const li = document.createElement("li");
        li.innerText = `⚠️ ${r}`;
        riskList.appendChild(li);
    });

    const branchList = document.getElementById("branchSummary");
    branches.forEach(b => {
        const li = document.createElement("li");
        li.innerText = `${b.branch} – ${b.result}`;
        branchList.appendChild(li);
    });
};
