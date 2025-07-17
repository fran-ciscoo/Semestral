import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category:{
        type: String,
        required: true,
        enum: ['Dulces', 'Salados', 'Acidos', 'Picantes', 'Bebidas']
    },
    origin: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['disponible', 'descontinuado', 'agotado'],
        default: 'disponible'
    },
    story: {
        type: String,
        required: true
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
