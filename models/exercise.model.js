import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["cardio", "strength", "flixibilty", "balance"],
        required: true
    },
    muscleGroup: {
        type: String,
    }
}, { timestamps: true });

export const Exercise = mongoose.model("Exercise", exerciseSchema);