import Points from '../models/points.model.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const secretKey = 'clave_secreta_segura_y_larga';

export default async function pointsRoutes(fastify, reply) {
    
    fastify.get('/', async (request, reply) => {
        try {
            const token = request.cookies.token;
            if (!token) {
                return reply.status(401).send({ error: 'No autorizado. Debes iniciar sesión.' });
            }

            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;

            const points = await Points.findOne({ userId });

            if (!points) {
                return reply.status(404).send({ error: 'No se encontraron puntos para este usuario.' });
            }

            return reply.status(200).send({ points });
        } catch (error) {
            console.error('Error al obtener puntos:', error);
            return reply.status(500).send({ error: 'Error del servidor al obtener puntos.' });
        }
    });

    // Agregar puntos después de una compra
    fastify.post('/add', async (request, reply) => {
        try {
            const token = request.cookies.token;
            if (!token) {
                return reply.status(401).send({ error: 'No autorizado. Debes iniciar sesión.' });
            }

            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;

            const { orderId } = request.body;

            const order = await Order.findById(orderId);
            if (!order || order.userId.toString() !== userId) {
                return reply.status(404).send({ error: 'Orden no encontrada o no pertenece al usuario.' });
            }

            const pointsEarned = Math.floor(order.totalAmount); // 1 punto por cada $1

            const userPoints = await Points.findOneAndUpdate(
                { userId },
                {
                    $inc: {
                        totalPoints: pointsEarned,
                        pointsPerPurchase: pointsEarned,
                    },
                },
                { new: true, upsert: true }
            );

            return reply.status(200).send({ message: 'Puntos añadidos correctamente.', points: userPoints });
        } catch (error) {
            console.error('Error al añadir puntos:', error);
            return reply.status(500).send({ error: 'Error del servidor al añadir puntos.' });
        }
    });

    // Redimir puntos (por ejemplo, para descuento u otros usos)
    fastify.post('/redeem', async (request, reply) => {
        try {
            const token = request.cookies.token;
            if (!token) {
                return reply.status(401).send({ error: 'No autorizado. Debes iniciar sesión.' });
            }

            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;

            const { amountToRedeem } = request.body;

            const userPoints = await Points.findOne({ userId });
            if (!userPoints || userPoints.totalPoints < amountToRedeem) {
                return reply.status(400).send({ error: 'No tienes suficientes puntos.' });
            }

            userPoints.totalPoints -= amountToRedeem;
            userPoints.usedPoints += amountToRedeem;
            userPoints.lastRedeemDate = new Date();

            await userPoints.save();

            return reply.status(200).send({ message: 'Puntos redimidos exitosamente.', points: userPoints });
        } catch (error) {
            console.error('Error al redimir puntos:', error);
            return reply.status(500).send({ error: 'Error del servidor al redimir puntos.' });
        }
    });
}
