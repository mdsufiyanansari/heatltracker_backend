import Activity from "../models/Activity.js";
import Assessment from "../models/Assessment.js";

export async function getDashboard(req, res, next) {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
    const startWeek = new Date(now); startWeek.setDate(now.getDate() - 6); startWeek.setHours(0, 0, 0, 0);

    const [allStats, todayStats, weekActivities, recentActivities, latestAssessment] = await Promise.all([
      Activity.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, totalActivities: { $sum: 1 }, totalMinutes: { $sum: "$durationMinutes" }, totalDistanceKm: { $sum: "$distanceKm" }, totalCalories: { $sum: "$calories" } } }
      ]),
      Activity.aggregate([
        { $match: { user: userId, completedAt: { $gte: startToday } } },
        { $group: { _id: null, activities: { $sum: 1 }, minutes: { $sum: "$durationMinutes" }, distanceKm: { $sum: "$distanceKm" }, calories: { $sum: "$calories" } } }
      ]),
      Activity.find({ user: userId, completedAt: { $gte: startWeek } }).sort({ completedAt: 1 }),
      Activity.find({ user: userId }).sort({ completedAt: -1 }).limit(5),
      Assessment.findOne({ user: userId }).sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      user: { id: req.user._id, name: req.user.name, email: req.user.email },
      totals: allStats[0] || { totalActivities: 0, totalMinutes: 0, totalDistanceKm: 0, totalCalories: 0 },
      today: todayStats[0] || { activities: 0, minutes: 0, distanceKm: 0, calories: 0 },
      weeklyActivities: weekActivities,
      recentActivities,
      latestPlan: latestAssessment?.plan || null
    });
  } catch (err) { next(err); }
}
