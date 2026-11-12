
export function calculateMatchScore(candidate, job) {
  let score = 50; // Base score
  const weights = {
    shift: 15,
    location: 10,
    skills: 15,
    experience: 10
  };

  // Shift match
  if (candidate.shift === job.shift) {
    score += weights.shift;
  }

  // Location match
  if (candidate.location === job.location) {
    score += weights.location;
  }

  // Skills match
  const requiredSkills = job.requirements || [];
  const candidateSkills = candidate.skills || [];
  const matchingSkills = requiredSkills.filter(skill => 
    candidateSkills.some(candSkill => 
      candSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  score += (matchingSkills.length / requiredSkills.length) * weights.skills;

  // Experience match
  if (candidate.yearsExperience >= (job.requiredExperience || 0)) {
    score += weights.experience;
  }

  return Math.min(Math.round(score), 100);
}

export function getMatchLabel(score) {
  if (score >= 90) return 'Excellent Match';
  if (score >= 75) return 'Good Match';
  if (score >= 60) return 'Fair Match';
  return 'Basic Match';
}
