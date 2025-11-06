import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js'
import { createWorkout, updateWorkout } from '../controllers/workout.controller.js';

const router = express.Router();

router.route('/new').post(isAuthenticated, createWorkout);
router.route('/update/:workoutId').post(isAuthenticated, updateWorkout);

export default router;
