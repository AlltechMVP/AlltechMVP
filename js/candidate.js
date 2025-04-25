
// Mock candidate data (simulate logged-in candidate)
const candidate = {
    name: "Lena James",
    email: "lj@a.com", 
    phone: "555-876-4321",
    jobTitle: "Forklift Operator",
    status: "Ready for Placement",
    resume: "#",
    idUpload: "#",
    onboarding: {
        acknowledgedPolicies: true,
        acknowledgedHandbook: true,
        idUploaded: true,
        eSigned: true
    }
};

function loadCandidateInfo() {
    const infoDiv = document.getElementById("candidateInfo");
    infoDiv.innerHTML = `
        <p><strong>Name:</strong> ${candidate.name}</p>
        <p><strong>Email:</strong> ${candidate.email}</p>
        <p><strong>Phone:</strong> ${candidate.phone}</p>
        <p><strong>Job Title:</strong> ${candidate.jobTitle}</p>
        <p><strong>Application Status:</strong> ${candidate.status}</p>
        <p><a href="${candidate.resume}" target="_blank">View Resume</a></p>
        <p><a href="${candidate.idUpload}" target="_blank">View Uploaded ID</a></p>
    `;

    const steps = [
        { label: "Acknowledged Company Policies", key: "acknowledgedPolicies" },
        { label: "Acknowledged Handbook", key: "acknowledgedHandbook" },
        { label: "Uploaded ID", key: "idUploaded" },
        { label: "Signed Electronically", key: "eSigned" }
    ];

    const checklist = document.getElementById("onboardingChecklist");
    checklist.innerHTML = '';
    steps.forEach(step => {
        const li = document.createElement("li");
        li.innerHTML = candidate.onboarding[step.key]
            ? `✅ ${step.label}`
            : `❌ ${step.label}`;
        checklist.appendChild(li);
    });
}

window.onload = loadCandidateInfo;
