import Subcriptor from '../models/subcriptor.model.js';
import User from '../models/user.model.js';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const secretKey = 'clave_secreta_segura_y_larga';

export default async function subcriptorRoutes(fastify, opts) {
    fastify.get('/', async (request, reply) => {
        try {
            const subs = await Subcriptor.find();
            return reply.status(200).send({ subs });
        } catch (error) {
            console.error('Error al obtener subscriptores:', error);
            return reply.status(500).send({ error: 'Error del servidor al obtener subscriptores.' });
        }
    });
    fastify.post('/', async (request, reply) => {
        try {
            const token = request.cookies.token;
            if (!token) {
                return reply.status(401).send({ error: 'No autorizado. Debes iniciar sesión.' });
            }
            const decoded = jwt.verify(token, secretKey);
            const { nombre, price } = request.body;
            if (!nombre || !price) {
                return reply.status(400).send({ error: 'Nombre y precio son obligatorios.' });
            }
            const product = await stripe.products.create({
                name: nombre,
                description: 'Subscriptor para SnackScript',
            });

            const priceObj = await stripe.prices.create({
                unit_amount: price * 100,
                currency: 'usd',
                recurring: {
                    interval: 'month' 
                },
                product: product.id,
            });

            const nuevo = new Subcriptor({
                nombre,
                price,
                priceId: priceObj.id
            });

            await nuevo.save();
            return reply.status(201).send({ message: 'Subscriptor creado exitosamente.', subcriptor: nuevo });
        } catch (error) {
            console.error('Error al crear subscriptor:', error);
            return reply.status(500).send({ error: 'Error del servidor al crear subscriptor.' });
        }
    });
    fastify.post('/session', async (request, reply) => {
        try {
            const token = request.cookies.token;
            if (!token) {
                return reply.status(401).send({ error: 'No autorizado. Debes iniciar sesión.' });
            }
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;
            const { subcriptorId } = request.body;
            if (!subcriptorId) {
                return reply.status(400).send({ error: 'El ID de la suscripción es obligatorio.' });
            }
            const subcriptor = await Subcriptor.findById(subcriptorId);
            if (!subcriptor) {
                return reply.status(404).send({ error: 'Subscriptor no encontrado.' });
            }
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'subscription',
                line_items: [
                    {
                        price: subcriptor.priceId,
                        quantity: 1
                    }
                ],
                success_url: 'http://localhost:3000/view/perfil.html?session_id={CHECKOUT_SESSION_ID}',
                cancel_url: 'http://localhost:3000/view/perfil.html?session_id={CHECKOUT_SESSION_ID}'
            });
            return reply.status(200).send({ url: session.url });
        } catch (error) {
            console.error('Error al crear sesión de suscripción:', error);
            return reply.status(500).send({ error: 'Error del servidor al crear la sesión de suscripción.' });
        }
    });
    fastify.post('/verificar', async (request, reply) => {
        try {
            const { session_id } = request.body;
            if (!session_id) {
                return reply.status(400).send({ error: 'Falta el ID de la sesión.' });
            }

            const token = request.cookies.token;
            if (!token) {
                return reply.status(401).send({ error: 'No autorizado. Debes iniciar sesión.' });
            }

            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;

            // Recuperar la sesión sin expandir
            const session = await stripe.checkout.sessions.retrieve(session_id);

            if (!session.subscription) {
                return reply.status(400).send({ error: 'No se encontró una suscripción asociada.' });
            }

            // Recuperar la suscripción directamente
            const subscription = await stripe.subscriptions.retrieve(session.subscription);

            if (subscription.status === 'active') {
                await User.findByIdAndUpdate(userId, { role: 'subscriber', hasActiveSubscription: true });
                return reply.status(200).send({ message: 'Suscripción verificada', status: subscription.status });
            } else {
                return reply.status(200).send({ message: 'Suscripción no activa', status: subscription.status });
            }
        } catch (error) {
            console.error('Error al verificar suscripción:', error);
            return reply.status(500).send({ error: 'Error del servidor al verificar suscripción.' });
        }
    });

    fastify.delete('/:id', async (request, reply) => {
        try {
            const token = request.cookies.token;
            if (!token) {
                return reply.status(401).send({ error: 'No autorizado. Debes iniciar sesión.' });
            }

            const decoded = jwt.verify(token, secretKey);
            const { id } = request.params;

            const deleted = await Subcriptor.findByIdAndDelete(id);
            if (!deleted) {
                return reply.status(404).send({ error: 'Subscriptor no encontrado.' });
            }

            return reply.status(200).send({ message: 'Subscriptor eliminado correctamente.' });
        } catch (error) {
            console.error('Error al eliminar subscriptor:', error);
            return reply.status(500).send({ error: 'Error del servidor al eliminar subscriptor.' });
        }
    });
}
