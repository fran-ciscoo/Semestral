import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Coupon from '../models/coupon.model.js';
import Points from '../models/points.model.js';
import PointsHistory from '../models/pointHistory.modal.js';
import mongoose from 'mongoose';
const secretKey = 'clave_secreta_segura_y_larga';

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
    fastify.put('/buyCoupon', async (request, reply) => {
        try {
            const token = request.cookies.token;
            if (!token) {
                return reply.status(401).send({ error: 'No autorizado. Debes iniciar sesión.' });
            }

            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;
            const { couponId } = request.body;

            if (!couponId) {
                return reply.status(400).send({ error: 'El ID del cupón es obligatorio.' });
            }

            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return reply.status(404).send({ error: 'Cupón no encontrado.' });
            }

            const userPoints = await Points.findOne({ userId });
            if (!userPoints || userPoints.totalPoints < coupon.valuePoints) {
                return reply.status(400).send({ error: 'Puntos insuficientes para canjear este cupón.' });
            }
            userPoints.totalPoints -= coupon.valuePoints;
            userPoints.usedPoints += coupon.valuePoints;
            userPoints.lastRedeemDate = new Date();
            await userPoints.save();
            const historyEntry = new PointsHistory({
                userId,
                description: `Canje de cupón: ${coupon.name}`,
                actionPoints: `-${coupon.valuePoints}`,
                date: new Date()
            });
            await historyEntry.save();

            // Agregar cupón al usuario
            const user = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { couponsChanged: couponId } },
                { new: true }
            ).populate('couponsChanged');

            return reply.status(200).send({
                message: 'Cupón canjeado con éxito.',
                updatedPoints: {
                    totalPoints: userPoints.totalPoints,
                    usedPoints: userPoints.usedPoints
                },
                couponsChanged: user.couponsChanged
            });

        } catch (error) {
            console.error('Error al canjear cupón:', error);
            return reply.status(500).send({ error: error.message || 'Error al canjear cupón.' });
        }
    });


    fastify.get('/', async (request, reply) => {
        try {
            const coupons = await Coupon.find();
            if (!coupons || coupons.length === 0) {
                return reply.status(404).send({ message: 'No hay cupones disponibles.' });
            }
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