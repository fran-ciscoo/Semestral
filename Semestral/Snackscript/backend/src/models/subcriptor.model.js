import mongoose from 'mongoose';
const subcriptorSchema = new mongoose.Schema({
    nombre: {
        type: String,       
        required: true
    },
    price: {
        type: Number,       
        required: true
    },
    priceId: {
        type: String,       
        required: true
    }
});
const Subcriptor = mongoose.model('Subcriptor', subcriptorSchema);
export default Subcriptor;