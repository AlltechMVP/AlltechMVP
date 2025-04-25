// Mock data for sales rep dashboard
const leads = [
    { name: "Metro Logistics", status: "Follow-Up", contact: "steve@metro.com" },
    { name: "NorthPoint Tech", status: "Cold", contact: "hr@northpoint.io" },
    { name: "Bright Staffing", status: "Hot Lead", contact: "paula@brightstaff.com" }
];

const jobOrders = [
    { title: "Warehouse Loaders – Dallas", date: "2025-04-12", client: "Metro Logistics" },
    { title: "Assemblers – Night Shift", date: "2025-04-17", client: "Bright Staffing" }
];

const commissions = [
    { client: "Metro Logistics", value: "$480", status: "Pending" },
    { client: "Bright Staffing", value: "$320", status: "Earned" }
];

window.onload = () => {
    const clientList = document.getElementById("clientList");
    leads.forEach(lead => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${lead.name}</strong> – ${lead.status} (<a href="mailto:${lead.contact}">${lead.contact}</a>)`;
        clientList.appendChild(li);
    });

    const jobList = document.getElementById("jobOrderList");
    jobOrders.forEach(order => {
        const li = document.createElement("li");
        li.innerHTML = `${order.title} for ${order.client} (submitted ${order.date})`;
        jobList.appendChild(li);
    });

    const commissionList = document.getElementById("commissionList");
    commissions.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `${item.client}: ${item.value} – ${item.status}`;
        commissionList.appendChild(li);
    });
};