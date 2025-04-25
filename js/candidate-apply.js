
function handleSubmit(event) {
    event.preventDefault();

    const mockCandidateProfile = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        jobInterest: document.getElementById('jobInterest').value,
        availability: document.getElementById('availability').value,
        resumeFile: document.getElementById('resume').files[0]?.name || '',
        appliedAt: new Date().toISOString()
    };

    localStorage.setItem('candidateProfile', JSON.stringify(mockCandidateProfile));
    window.location.href = 'onboard.html';
}
