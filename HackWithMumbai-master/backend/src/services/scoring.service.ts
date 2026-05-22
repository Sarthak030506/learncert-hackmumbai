export const scoringService = {
  calculateCredibilityScore: (session: any) => {
    // 1. Completion
    // Total unique watched time / duration
    // For MVP, we'll just use totalWatchTime / duration if watchedSegments are tricky
    const duration = session.video.duration || 1;
    let completion = (session.totalWatchTime / duration) * 100;
    if (completion > 100) completion = 100;
    
    // 2. Engagement
    // Pauses and seeks affect engagement
    let engagement = 100;
    const pausePenalty = (session.pauseCount || 0) * 2; // 2 points per pause
    engagement -= pausePenalty;
    if (engagement < 0) engagement = 0;

    // 3. Focus
    // tabActiveTime vs tabInactiveTime
    let focus = 100;
    const totalTime = session.tabActiveTime + session.tabInactiveTime;
    if (totalTime > 0) {
      focus = (session.tabActiveTime / totalTime) * 100;
    }

    // Penalties
    let speedPenalty = 0;
    if (session.averageSpeed > 1.5) speedPenalty = 5;
    if (session.averageSpeed > 2.0) speedPenalty = 10;
    
    let skipPenalty = (session.seekEvents?.filter((e: any) => e.direction === 'forward').length || 0) * 1;
    if (skipPenalty > 5) skipPenalty = 5;
    
    let inactivityPenalty = 0;
    if (totalTime > 0) {
      inactivityPenalty = (session.tabInactiveTime / totalTime) * 5;
    }

    // Final Score
    let finalScore = (completion * 0.35) + (engagement * 0.25) + (focus * 0.20);
    finalScore = finalScore - speedPenalty - skipPenalty - inactivityPenalty;
    
    if (finalScore < 0) finalScore = 0;
    if (finalScore > 100) finalScore = 100;

    return {
      completion,
      engagement,
      focus,
      speedPenalty,
      skipPenalty,
      inactivityPenalty,
      finalScore
    };
  },

  checkEligibility: (session: any) => {
    const score = scoringService.calculateCredibilityScore(session);
    const eligible = score.finalScore >= 70 && score.completion >= 80;
    const reasons = [];
    
    if (score.finalScore < 70) reasons.push("Credibility score below 70");
    if (score.completion < 80) reasons.push("Completion below 80%");
    
    return {
      eligible,
      score,
      reasons
    };
  }
};
