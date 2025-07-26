import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    valuePoints: {
        type: Number,
        required: true
    },
    type:{
        type: String,
        enum: ['PRODUCTO', 'DESCUENTO'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    discountAmount: {
        type: Number,
        min: 0
    },
    applicableTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    expiresAt: {
        type: Date
    },
});

const Coupon = mongoose.model('Coupon', CouponSchema);
export default Coupon;
