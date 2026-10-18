export function createWorkoutPlan(input) {
  const {
    age, fitnessLevel, currentDistanceKm, targetDistanceKm,
    weeklyTrainingDays, availableMinutes
  } = input;

  const beginner = fitnessLevel === "Beginner";
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const activities = beginner
    ? ["Walk + easy jog", "Rest or gentle mobility", "Easy walk", "Walk + short jog", "Rest or stretching", "Easy run/walk", "Rest"]
    : fitnessLevel === "Intermediate"
      ? ["Easy run", "Strength training", "Recovery walk", "Tempo intervals", "Rest or mobility", "Long easy run", "Rest"]
      : ["Easy run", "Strength training", "Interval session", "Recovery run", "Mobility", "Long run", "Rest"];

  const weeklyPlan = days.map((day, index) => {
    const isRest = activities[index].startsWith("Rest");
    const trainingDay = index < weeklyTrainingDays;
    return {
      day,
      activity: (!trainingDay || isRest) ? (isRest ? activities[index] : "Rest / recovery") : activities[index],
      durationMinutes: (!trainingDay || isRest) ? 0 : Math.max(10, Math.min(availableMinutes, index === 5 ? Math.round(availableMinutes * 1.2) : availableMinutes)),
      intensity: isRest ? "Rest" : beginner ? "Low" : fitnessLevel === "Intermediate" ? "Moderate" : "High"
    };
  });

  const gap = Math.max(0, Number((targetDistanceKm - currentDistanceKm).toFixed(1)));
  return {
    summary: `A ${fitnessLevel.toLowerCase()} plan for ${weeklyTrainingDays} training days per week, with sessions around ${availableMinutes} minutes.`,
    goal: `Build gradually from ${currentDistanceKm} km toward ${targetDistanceKm} km.`,
    weeklyPlan,
    recommendations: [
      `Increase running distance gradually; current target gap is ${gap} km.`,
      "Warm up for 5–10 minutes and cool down after each session.",
      "Drink water and take rest days when you feel unusually tired."
    ],
    safetyNotes: [
      "This is general fitness guidance, not medical advice.",
      "Stop if you feel chest pain, faintness, or unusual shortness of breath.",
      age >= 60 ? "Consider medical advice before starting a new vigorous exercise plan." : "If you have a medical condition or injury, consult a qualified professional."
    ]
  };
}
