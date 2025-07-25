import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false })

const shippingAddressSchema = new mongoose.Schema({
    country: String,
    city: String,
    address: String,
    postalCode: String
}, { _id: false })

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
        type: String,
        enum: ['stripe'],
        default: 'stripe',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDIENTE', 'EN PREPARACIÓN', 'EN CAMINO', 'ENTREGADO', 'CANCELADO'],
        default: 'PENDIENTE'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    orderedAt: {
        type: Date,
        default: Date.now
    }
})

const Order = mongoose.model('Order', orderSchema)
export default Order
