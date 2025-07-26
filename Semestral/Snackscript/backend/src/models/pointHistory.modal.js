import mongoose from 'mongoose';

const pointHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: true,
    },
    actionPoints: {
        type: String,
        required: true,
    }
});

const PointHistory = mongoose.model('PointHistory', pointHistorySchema);
export default PointHistory;