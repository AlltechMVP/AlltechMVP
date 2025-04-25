
window.onload = () => {
    const recruiterStats = [
        { name: "Sarah Lin", submitted: 12, placed: 7 },
        { name: "Dev Patel", submitted: 9, placed: 5 },
        { name: "Alex Monroe", submitted: 14, placed: 10 }
    ];

    const timecardAlerts = [
        { employee: "Julio Diaz", issue: "Missed punch-in", job: "Night Loader" },
        { employee: "Trina Young", issue: "Incomplete lunch break", job: "Picker" }
    ];

    const fillRates = [
        { job: "Packers – 2nd shift", filled: 8, open: 10 },
        { job: "Forklift Drivers", filled: 5, open: 5 },
        { job: "Janitorial – PT", filled: 2, open: 4 }
    ];

    const recruiterList = document.getElementById("recruiterStats");
    recruiterStats.forEach(r => {
        const li = document.createElement("li");
        li.innerText = `${r.name}: ${r.submitted} submitted / ${r.placed} placed`;
        recruiterList.appendChild(li);
    });

    const timecardList = document.getElementById("timecardAlerts");
    timecardAlerts.forEach(tc => {
        const li = document.createElement("li");
        li.innerText = `${tc.employee} – ${tc.issue} on ${tc.job}`;
        timecardList.appendChild(li);
    });

    const fillList = document.getElementById("fillSummary");
    fillRates.forEach(job => {
        const li = document.createElement("li");
        li.innerText = `${job.job}: ${job.filled} filled of ${job.open} open`;
        fillList.appendChild(li);
    });
};
