
window.onload = () => {
    const kpis = [
        { metric: "Average Time to Fill", value: "4.2 days" },
        { metric: "Retention Rate", value: "92%" },
        { metric: "Total Active Placements", value: "437" },
        { metric: "Gross Margin", value: "24.5%" }
    ];

    const automation = [
        { tool: "Auto-matching", usage: "78% adoption", trend: "↑" },
        { tool: "Smart Scheduling", usage: "65% adoption", trend: "↑" },
        { tool: "Digital Onboarding", usage: "92% adoption", trend: "→" }
    ];

    const risks = [
        { branch: "Dallas", issue: "High turnover rate in warehouse roles" },
        { branch: "Phoenix", issue: "Compliance training overdue" },
        { branch: "Miami", issue: "Safety incident reports increased" }
    ];

    const branches = [
        { name: "Houston", performance: "Top", metric: "+15% YoY growth" },
        { name: "Chicago", performance: "Top", metric: "98% client retention" },
        { name: "Atlanta", performance: "Bottom", metric: "-8% placement rate" },
        { name: "Denver", performance: "Bottom", metric: "High contractor churn" }
    ];

    const kpiList = document.getElementById("kpiList");
    kpis.forEach(kpi => {
        const li = document.createElement("li");
        li.innerHTML = `${kpi.metric}: <strong>${kpi.value}</strong>`;
        kpiList.appendChild(li);
    });

    const automationList = document.getElementById("automationList");
    automation.forEach(tool => {
        const li = document.createElement("li");
        li.innerHTML = `${tool.tool}: ${tool.usage} ${tool.trend}`;
        automationList.appendChild(li);
    });

    const riskList = document.getElementById("riskAlerts");
    risks.forEach(risk => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${risk.branch}</strong>: ${risk.issue}`;
        riskList.appendChild(li);
    });

    const branchList = document.getElementById("branchSummary");
    branches.forEach(branch => {
        const li = document.createElement("li");
        li.innerHTML = `${branch.name} (${branch.performance}): ${branch.metric}`;
        branchList.appendChild(li);
    });
};
