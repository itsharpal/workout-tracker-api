import dotenv from 'dotenv';
import { connectDB } from '../utils/db.js';
import { Exercise } from '../models/exercise.model.js';
import { exercises } from './data.js';

dotenv.config();

const seedExercises = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing exercises...');
    await Exercise.deleteMany();

    console.log('🌱 Inserting new exercises...');
    await Exercise.insertMany(exercises);

    console.log('✅ Exercises seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedExercises();