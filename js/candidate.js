
import { supabase } from './supabase.js';

const candidate = {
    name: "Lena James",
    email: "lj@a.com",
    phone: "555-876-4321",
    applications: [
        {
            jobTitle: "Forklift Operator",
            status: "Ready for Placement",
            resume: "#",
            idUpload: "#",
            onboarding: {
                acknowledgedPolicies: true,
                handbook: true,
                idUploaded: true,
                eSigned: true
            }
        },
        {
            jobTitle: "Warehouse Associate",
            status: "Submitted",
            resume: "#",
            idUpload: null,
            onboarding: {
                acknowledgedPolicies: false,
                handbook: false,
                idUploaded: false,
                eSigned: false
            }
        }
    ]
};

window.onload = () => {
    const infoDiv = document.getElementById("profileInfo");
    infoDiv.innerHTML = `
        <p><strong>Name:</strong> ${candidate.name}</p>
        <p><strong>Email:</strong> ${candidate.email}</p>
        <p><strong>Phone:</strong> ${candidate.phone}</p>
    `;

    const tbody = document.querySelector("#applicationsTable tbody");
    candidate.applications.forEach((app, index) => {
        const progress = getOnboardingStatus(app.onboarding);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${app.jobTitle}</td>
            <td>${app.status}</td>
            <td><a href="${app.resume}" target="_blank">Resume</a></td>
            <td>${app.idUpload ? `<a href="${app.idUpload}" target="_blank">View ID</a>` : "Not uploaded"}</td>
            <td>${progress}</td>
        `;
        tbody.appendChild(row);
    });
};

function getOnboardingStatus(onboarding) {
    const total = Object.keys(onboarding).length;
    const completed = Object.values(onboarding).filter(v => v).length;
    return `${completed}/${total} steps completed`;
}
