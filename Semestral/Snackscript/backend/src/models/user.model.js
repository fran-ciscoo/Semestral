import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    shippingAddress: {
        country: {
            type: String,
            default: 'Panamá',
            immutable: true
        },
        city: String,
        address: String,
    },
    phone: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'subscriber', 'admin'],
        default: 'user'
    },
    session: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    }],
    hasActiveSubscription: {
        type: Boolean,
        default: false
    },
    points: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Points'
    }],
    purchaseHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model('User', userSchema)
export default User
