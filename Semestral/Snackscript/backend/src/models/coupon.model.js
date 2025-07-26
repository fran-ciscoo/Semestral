import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    discountAmount: {
        type: Number,
        required: true,
        min: 0
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    valuePoints: {
        type: Number,
        required: true
    },
    applicableTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
});

const Coupon = mongoose.model('Coupon', CouponSchema);
export default Coupon;
