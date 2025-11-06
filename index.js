import express, { json } from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './utils/db.js';
import userRoute from './routes/user.route.js';
import workoutRoute from './routes/workout.route.js';
import dotenv from 'dotenv';
dotenv.config({});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//routes
app.use('/api/user', userRoute);
app.use('/api/workout', workoutRoute);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
})