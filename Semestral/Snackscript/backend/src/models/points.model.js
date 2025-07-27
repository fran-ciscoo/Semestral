import mongoose from 'mongoose'

const pointsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    totalPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    usedPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    pointsPerPurchase: {
        type: Number,
        default: 0,
        min: 0
    },
    lastRedeemDate: {
        type: Date,
        default: null
    },
    lastEarnedDate: {
        type: Date,
        default: null
    }
})

const Points = mongoose.model('Points', pointsSchema)
export default Points
