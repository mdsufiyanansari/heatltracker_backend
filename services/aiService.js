
function generateWorkoutPlan(profile) {
  const {
    age,
    fitnessLevel,
    currentDistanceKm,
    targetDistanceKm,
    weeklyTrainingDays,
    availableMinutes,
  } = profile;

  const isBeginner = fitnessLevel === "Beginner";
  const isAdvanced = fitnessLevel === "Advanced";

  const safeCurrentDistance = Math.max(0, currentDistanceKm);
  const distanceGap = Math.max(
    0,
    targetDistanceKm - safeCurrentDistance
  );

  const baseDuration = isBeginner
    ? Math.min(availableMinutes, 20)
    : isAdvanced
      ? Math.min(availableMinutes, 45)
      : Math.min(availableMinutes, 30);

  const runDistance = Math.max(
    0.5,
    Math.min(
      targetDistanceKm,
      safeCurrentDistance > 0
        ? safeCurrentDistance * 1.1
        : 0.5
    )
  );

  const activities = [
    {
      activity: `Easy walk/run: approximately ${runDistance.toFixed(1)} km`,
      intensity: "Low",
    },
    {
      activity: "Brisk walking and mobility exercises",
      intensity: "Low",
    },
    {
      activity: "Rest and recovery",
      intensity: "Low",
    },
    {
      activity: "Easy jogging with a gentle warm-up",
      intensity: "Moderate",
    },
    {
      activity: "Bodyweight strength: squats, wall push-ups and core",
      intensity: "Moderate",
    },
    {
      activity: "Comfortable walk or light cycling",
      intensity: "Low",
    },
    {
      activity: "Rest day and progress review",
      intensity: "Low",
    },
  ];

  const weeklyPlan = activities.map((item, index) => {
    const isRestDay = item.activity.toLowerCase().includes("rest");
    const isTrainingDay = index < weeklyTrainingDays;

    return {
      day: `Day ${index + 1}`,
      activity:
        isTrainingDay || isRestDay
          ? item.activity
          : "Rest or gentle mobility",
      durationMinutes:
        isTrainingDay && !isRestDay ? baseDuration : 0,
      intensity: item.intensity,
    };
  });

  return {
    summary:
      `A ${fitnessLevel.toLowerCase()}-level starter plan for age ${age}. ` +
      `Your current distance is ${safeCurrentDistance} km and your target is ${targetDistanceKm} km. ` +
      `The distance gap is ${distanceGap.toFixed(1)} km. Progress gradually rather than trying to close the gap immediately.`,
    weeklyPlan,
    safetyNotes: [
      "Start each workout with 5 minutes of gentle warm-up.",
      "Increase running distance gradually and take recovery days.",
      "Stop if you feel chest pain, dizziness or unusual shortness of breath, and seek appropriate medical advice.",
      "Choose a comfortable pace and adjust the plan to your ability.",
    ],
  };
}

module.exports = { generateWorkoutPlan };
