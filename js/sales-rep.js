
// Mock data for sales rep dashboard
const mockData = {
    leads: [
        { name: "Tech Corp", status: "New Lead", potential: "$50,000" },
        { name: "Manufacturing Inc", status: "Follow Up", potential: "$75,000" },
        { name: "Logistics Pro", status: "Proposal", potential: "$100,000" }
    ],
    jobOrders: [
        { client: "Tech Corp", position: "Software Engineer", status: "Open" },
        { client: "Manufacturing Inc", position: "Production Manager", status: "Filled" }
    ],
    commissions: {
        monthToDate: 4500,
        projected: 7500,
        placements: 3
    }
};

function loadDashboard() {
    // Load client leads
    const clientList = document.getElementById("clientList");
    clientList.innerHTML = mockData.leads.map(lead => `
        <li>
            <strong>${lead.name}</strong><br>
            Status: ${lead.status}<br>
            Potential: ${lead.potential}
        </li>
    `).join('');

    // Load job orders
    const jobOrderList = document.getElementById("jobOrderList");
    jobOrderList.innerHTML = mockData.jobOrders.map(job => `
        <li>
            <strong>${job.client}</strong><br>
            Position: ${job.position}<br>
            Status: <span class="${job.status.toLowerCase()}">${job.status}</span>
        </li>
    `).join('');

    // Load commission data
    const commissionList = document.getElementById("commissionList");
    commissionList.innerHTML = `
        <li>Month-to-Date: $${mockData.commissions.monthToDate}</li>
        <li>Projected: $${mockData.commissions.projected}</li>
        <li>Placements: ${mockData.commissions.placements}</li>
    `;
}

window.onload = loadDashboard;
