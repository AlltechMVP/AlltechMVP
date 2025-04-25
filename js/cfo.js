window.onload = () => {
    const invoices = {
        total: "$212,000",
        paid: "$182,000",
        unpaid: "$30,000",
        overdue: "$12,000"
    };

    const payroll = [
        { week: "Apr 1–5", payroll: "$56,000", revenue: "$91,500" },
        { week: "Apr 8–12", payroll: "$58,200", revenue: "$94,000" },
        { week: "Apr 15–19", payroll: "$59,800", revenue: "$89,600" }
    ];

    const margins = {
        current: "36.8%",
        target: "38%",
        trend: "Holding steady"
    };

    const alerts = [
        "Overdue AR: 3 invoices 30+ days late ($7,900)",
        "Funding reserve at 78% — approaching minimum threshold",
        "Client Tesla exceeded credit limit — hold on new placements"
    ];

    const invoiceStats = document.getElementById("invoiceStats");
    for (const [key, value] of Object.entries(invoices)) {
        const li = document.createElement("li");
        li.innerText = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
        invoiceStats.appendChild(li);
    }

    const payrollList = document.getElementById("payrollSummary");
    payroll.forEach(p => {
        const li = document.createElement("li");
        li.innerText = `${p.week} – Payroll: ${p.payroll}, Revenue: ${p.revenue}`;
        payrollList.appendChild(li);
    });

    const marginList = document.getElementById("marginSummary");
    for (const [key, value] of Object.entries(margins)) {
        const li = document.createElement("li");
        li.innerText = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
        marginList.appendChild(li);
    }

    const alertList = document.getElementById("alertsList");
    alerts.forEach(alert => {
        const li = document.createElement("li");
        li.innerText = `⚠️ ${alert}`;
        alertList.appendChild(li);
    });
};