window.onload = () => {
    const stats = {
        totalCandidates: 238,
        totalJobs: 44,
        totalClients: 19,
        totalPlacements: 153,
        avgBillRate: 32.50,
        avgPayRate: 20.00,
        grossMargin: 38.5,
        weeklyRevenue: 62500
    };

    const topRecruiters = [
        { name: "Alex Rivera", placements: 35 },
        { name: "Jordan Kim", placements: 27 },
        { name: "Morgan Lee", placements: 21 }
    ];

    const clients = [
        { name: "FedEx", openOrders: 5 },
        { name: "Tesla", openOrders: 3 },
        { name: "Amazon", openOrders: 7 }
    ];

    Object.entries(stats).forEach(([key, value]) => {
        document.getElementById(key).innerText = value;
    });

    const recruiterList = document.getElementById("recruiterList");
    topRecruiters.forEach(r => {
        const li = document.createElement("li");
        li.innerText = `${r.name} – ${r.placements} placements`;
        recruiterList.appendChild(li);
    });

    const clientList = document.getElementById("clientList");
    clients.forEach(c => {
        const li = document.createElement("li");
        li.innerText = `${c.name} – ${c.openOrders} open orders`;
        clientList.appendChild(li);
    });
};