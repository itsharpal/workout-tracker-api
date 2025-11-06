import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js'
import { createWorkout, deleteWorkoutHard, generateWorkoutReports, listWorkout, updateWorkout } from '../controllers/workout.controller.js';

const router = express.Router();

router.route('/new').post(isAuthenticated, createWorkout);
router.route('/update/:workoutId').post(isAuthenticated, updateWorkout);
router.route('/delete/:workoutId').get(isAuthenticated, deleteWorkoutHard);
router.route('/get').get(isAuthenticated, listWorkout);
router.route('/getReport').get(isAuthenticated, generateWorkoutReports);

export default router;
