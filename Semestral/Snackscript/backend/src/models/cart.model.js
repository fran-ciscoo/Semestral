import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
    },
    isFree: {
        type: Boolean,
        default: false
    }
})

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Coupon',
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Cart = mongoose.model('Cart', cartSchema)
export default Cart
