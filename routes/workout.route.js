import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js'
import { createWorkout, deleteWorkoutHard, listWorkout, updateWorkout } from '../controllers/workout.controller.js';

const router = express.Router();

router.route('/new').post(isAuthenticated, createWorkout);
router.route('/update/:workoutId').post(isAuthenticated, updateWorkout);
router.route('/delete/:workoutId').get(isAuthenticated, deleteWorkoutHard);
router.route('/get').get(isAuthenticated, listWorkout);

export default router;
