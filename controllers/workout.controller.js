import { Workout } from "../models/workout.model.js";
import { Exercise } from "../models/exercise.model.js";

export const createWorkout = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, exercises, scheduledAt, status, comments } = req.body;

        // Check if a workout with the same title exists for this user
        const existingWorkout = await Workout.findOne({ user: userId, title });
        if (existingWorkout) {
            return res.status(400).json({
                success: false,
                message: "Workout with this title already exists for this user.",
            });
        }

        // Create new workout
        const workout = await Workout.create({
            user: userId,
            title,
            description,
            exercises,
            scheduledAt,
            comments,
            status,
        });

        return res.status(201).json({
            success: true,
            message: "Workout created successfully.",
            workout,
        });
    } catch (error) {
        console.error("Error creating workout:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again later.",
        });
    }
};


export const updateWorkout = async (req, res) => {
    try {
        const userId = req.userId;
        const workoutId = req.params.workoutId;
        const { title, description, exercises, scheduledAt, status, comments, totalWorkouts, completedWorkouts, totalWeightLifted } = req.body;

        const updatedWorkout = {
            title,
            description,
            exercises,
            scheduledAt,
            status,
            comments,
            progressReport: { totalWorkouts, completedWorkouts, totalWeightLifted }
        }

        let workout = await Workout.findOneAndUpdate({ _id: workoutId, user: userId }, updatedWorkout, { new: true });
        if (!workout) {
            return res.status(404).json({
                message: "workout doesn't exists",
                success: false
            })
        }

        return res.status(200).json({
            success: true,
            message: "Workout updated successfully.",
            workout,
        });

    } catch (error) {
        console.error("Error updating workout:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again later.",
        });
    }
}


export const deleteWorkoutHard = async (req, res) => {
    try {
        const { workoutId } = req.params;
        const userId = req.userId;

        const workout = await Workout.findOneAndDelete({
            _id: workoutId,
            user: userId
        });

        if (!workout) {
            return res.status(404).json({
                success: false,
                message: "Workout not found or you do not have permission to delete it."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Workout permanently deleted.",
        });
    } catch (error) {
        console.error("Error deleting workout (hard):", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again later."
        });
    }
};


export const listWorkout = async (req, res) => {
    try {
        const userId = req.userId;
        const { status, sort } = req.query;

        const filter = { user: userId };
        if (status) { filter.status = status };

        const sortOrder = sort === "desc" ? -1 : 1

        const workouts = await Workout.find(filter).sort({ scheduledAt: sortOrder });
        if (workouts.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No workouts found for the given criteria.",
                workouts: []
            });
        }

        return res.status(200).json({
            success: true,
            message: "Workouts fetched successfully.",
            count: workouts.length,
            workouts
        })
    } catch (error) {
        console.error("Error deleting workout (hard):", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again later."
        });
    }
}


export const generateWorkoutReports = async (req, res) => {
    try {
        const userId = req.userId;
        const { from, to } = req.query;

        const filter = { user: userId };
        if (from || to) {
            filter.scheduledAt = {};
            if (from) filter.scheduledAt.$gte = new Date(from);
            if (to) filter.scheduledAt.$lte = new Date(to);
        }

        const workouts = await Workout.find(filter).populate("exercises.exercise", "name");;
        if (!workouts.length) {
            return res.status(200).json({
                success: true,
                message: "No workouts found for the selected period.",
                report: {},
            });
        }

        // Aggregate statistics
        const totalWorkouts = workouts.length;
        const completedWorkouts = workouts.filter(w => w.status === "completed").length;
        const pendingWorkouts = workouts.filter(w => w.status === "pending").length;
        const activeWorkouts = workouts.filter(w => w.status === "active").length;

        const totalWeightLifted = workouts.reduce((sum, w) => sum + (w.progressReport?.totalWeightLifted || 0), 0);

        const completionRate = ((completedWorkouts / totalWorkouts) * 100).toFixed(2);

        // Workouts done in last 7 / 30 days
        const now = new Date();
        const last7Days = workouts.filter(w => new Date(w.scheduledAt) >= new Date(now - 7 * 24 * 60 * 60 * 1000)).length;
        const last30Days = workouts.filter(w => new Date(w.scheduledAt) >= new Date(now - 30 * 24 * 60 * 60 * 1000)).length;


        // Most frequent exercises
        const exerciseCount = {};
        workouts.forEach(w => {
            w.exercises?.forEach(e => {
                const name = e.exercise?.name || e.name;
                if (name) exerciseCount[name] = (exerciseCount[name] || 0) + 1;
            });
        });

        const topExercises = Object.entries(exerciseCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        // Return response
        return res.status(200).json({
            success: true,
            message: "Workout report generated successfully.",
            report: {
                totalWorkouts,
                completedWorkouts,
                pendingWorkouts,
                activeWorkouts,
                totalWeightLifted,
                completionRate: `${completionRate}%`,
                last7Days,
                last30Days,
                topExercises
            }
        });

    } catch (error) {
        console.error("Error generating workout report:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again later.",
        });
    }
};