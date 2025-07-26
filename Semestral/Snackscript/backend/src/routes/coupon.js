import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Coupon from '../models/coupon.model.js';

export default async function couponRoutes(fastify, opts) {
    
    fastify.post('/', async (request, reply) => {
        const { name, valuePoints, type, discountAmount, applicableTo } = request.body;

        try {
            const newCoupon = new Coupon({
                name,
                valuePoints,
                type,
                discountAmount: type === 'DESCUENTO' ? discountAmount : undefined,
                applicableTo: type === 'PRODUCTO' ? applicableTo : []
            });
            await newCoupon.save();
            return reply.status(201).send({ message: 'Cupón creado exitosamente', coupon: newCoupon });
        } catch (error) {
            console.error("Error al crear el cupón:", error);
            return reply.status(500).send({ error: 'Error al crear el cupón' });
        }
    });

    fastify.get('/', async (request, reply) => {
        try {
            const coupons = await Coupon.find();
            return reply.status(200).send(coupons);
        } catch (error) {
            console.error("Error al obtener cupones:", error);
            return reply.status(500).send({ error: 'Error al obtener cupones' });
        }
    });

    fastify.patch('/:id', async (request, reply) => {
        const { isActive } = request.body;
        const { id } = request.params;
        try {
            const updated = await Coupon.findByIdAndUpdate(id, { isActive }, { new: true });
            return reply.send(updated);
        } catch (error) {
            return reply.status(500).send({ error: 'Error al actualizar el cupón' });
        }
    });

    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params;

        try {
            const deletedCoupon = await Coupon.findByIdAndDelete(id);
            if (!deletedCoupon) {
                return reply.status(404).send({ error: 'Cupón no encontrado' });
            }
            return reply.status(200).send({ message: 'Cupón eliminado exitosamente' });
        } catch (error) {
            console.error("Error al eliminar el cupón:", error);
            return reply.status(500).send({ error: 'Error al eliminar el cupón' });
        }
    });
}