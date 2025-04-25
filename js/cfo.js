
window.onload = () => {
    const invoices = {
        outstanding: "$642,500",
        overdue: "$128,400",
        pastDue30: "$84,300",
        pastDue60: "$44,100"
    };

    const payroll = {
        currentPayroll: "$384,600",
        projectedRevenue: "$892,300",
        payrollPercent: "43.1%",
        targetPercent: "40%"
    };

    const margins = {
        overallMargin: "38.5%",
        lightIndustrial: "42%",
        clerical: "36%",
        technical: "41%"
    };

    const alerts = [
        "Tesla invoice #4421 ($84,300) - 45 days overdue",
        "Funding request: North Branch ($125,000) for new client startup",
        "Margin alert: AutoParts Inc. below 15% threshold",
        "Credit limit reached: BuildCorp ($250,000)"
    ];

    const invoiceList = document.getElementById("invoiceStats");
    Object.entries(invoices).forEach(([key, value]) => {
        const li = document.createElement("li");
        li.innerHTML = `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: <strong>${value}</strong>`;
        invoiceList.appendChild(li);
    });

    const payrollList = document.getElementById("payrollSummary");
    Object.entries(payroll).forEach(([key, value]) => {
        const li = document.createElement("li");
        li.innerHTML = `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: <strong>${value}</strong>`;
        payrollList.appendChild(li);
    });

    const marginList = document.getElementById("marginSummary");
    Object.entries(margins).forEach(([key, value]) => {
        const li = document.createElement("li");
        li.innerHTML = `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: <strong>${value}</strong>`;
        marginList.appendChild(li);
    });

    const alertList = document.getElementById("alertsList");
    alerts.forEach(alert => {
        const li = document.createElement("li");
        li.innerHTML = `⚠️ ${alert}`;
        alertList.appendChild(li);
    });
};
