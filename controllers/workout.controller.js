import { Workout } from "../models/workout.model.js";

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
            progressReport: {totalWorkouts, completedWorkouts, totalWeightLifted}
        }

        let workout = await Workout.findOneAndUpdate({_id: workoutId, user: userId}, updatedWorkout, { new: true });
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