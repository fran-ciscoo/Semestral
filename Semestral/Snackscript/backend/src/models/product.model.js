import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['disponible', 'descontinuado', 'agotado'],
        default: 'disponible'
    },
    ingredients: {
        type: [String],
        default: []
    },
    origin: {
        type: String,
        required: true
    },
    story: {
        type: String
    },
    addedAt: {
        type: Date,
        default: Date.now
    },
    discontinuedAt: {
        type: Date,
        default: null
    }
})

const Product = mongoose.model('Product', productSchema)
export default Product
