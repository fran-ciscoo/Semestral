import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Cart from '../models/cart.model.js';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const secretKey = 'clave_secreta_segura_y_larga';
export default async function orderRoutes(fastify, reply) {

fastify.get('/status/:status', async (request, reply) => {
    const {status} = request.params;
    console.log(status);

        if (!status){
            return reply.status(400).send({error: 'Estatus no encontrado'});
        }

    try {
        const orders = await Order.find({status}).populate('userId');
        console.log(orders);
        return reply.status(200).send({orders});
    } catch(error){
        console.error('Error al buscar: ', error);
        return reply.status(500).send({error: 'Error en el server'});
    }
});

fastify.get('/', async (request, reply) => {
   try {
        const token = request.cookies.token;
        if (!token) {
            return reply.status(401).send({ error: 'No autorizado. Debes iniciar sesión.' });
        }

        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.id;

        const { status } = request.query;
        let query = { userId };

        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query).populate('userId').populate('items.product');
        return reply.status(200).send({ orders });
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        return reply.status(500).send({ error: 'Error en el servidor' });
    }
});

fastify.put('/:id', async (request, reply) => {
    const {id} = request.params;
    const {status} = request.body;

    if (!id || !status) {
        return reply.status(400).send({error: 'ID o estatus no proporcionados'});
    }

    try {
        const order = await Order.findByIdAndUpdate(id, {status}, {new: true});
        if (!order) {
            return reply.status(404).send({error: 'Pedido no encontrado'});
        }
        return reply.status(200).send(order);
    } catch (error) {
        console.error('Error al actualizar el pedido:', error);
        return reply.status(500).send({error: 'Error en el servidor'});
    }
});

    fastify.post('/verificar-pago', async (request, reply) => {
        try {
            const { session_id } = request.body;
            const session = await stripe.checkout.sessions.retrieve(session_id, {
                expand: ['total_details.breakdown']
            });
            const discountAmount = session.total_details?.breakdown?.discounts?.[0]?.amount || 0;
            const token = request.cookies.token;
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;
            const user = await User.findById(userId).select('-password');
            const cart = await Cart.findOne({ userId }).populate('items.product');
            if (!cart || !cart.items.length) {
                return reply.status(400).send({ message: 'Carrito vacío.' });
            }
            const items = cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price
            }));
            const newOrder = await Order.create({
                userId,
                items,
                shippingAddress: user.shippingAddress,
                paymentMethod: 'stripe',
                status: session.payment_status === 'paid' ? 'PENDIENTE' : 'CANCELADO',
                totalAmount: session.amount_total / 100,
                subtotal: cart.totalAmount,
                stripeSessionId: session.id,
                descuento: discountAmount / 100
            });
            /* await Cart.updateOne({ userId }, { $set: { items: [], totalAmount: 0 } }); */
            return reply.status(201).send({ message: 'Orden creada', order: newOrder });
        } catch (err) {
            console.error(err);
            return reply.status(500).send({ message: 'Error al verificar el pago' });
        }
    });

    fastify.post('/repeat/:orderId', async (request, reply) => {
        try {
            const { orderId } = request.params;
            const token = request.cookies.token;
            if (!token) {
                return reply.status(401).send({ message: 'No autorizado' });
            }
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;
            const order = await Order.findById(orderId).populate('items.product');
            if (!order) {
                return reply.status(404).send({ message: 'Pedido no encontrado' });
            }
            let addedCount = 0;
            let totalToAdd = 0;
            for (const item of order.items) {
                const product = item.product;
                const quantity = item.quantity;
                if (!product || product.stock < quantity) continue;
                const cart = await Cart.findOne({ userId });
                const existingItem = cart?.items.find(i => i.product.toString() === product._id.toString());
                if (existingItem) {
                    await Cart.updateOne(
                        { userId, 'items.product': product._id },
                        { $inc: { 'items.$.quantity': quantity } }
                    );
                } else {
                    await Cart.updateOne(
                        { userId },
                        {
                            $push: {
                                items: {
                                    product: product._id,
                                    quantity,
                                    price: product.price
                                }
                            }
                        },
                        { upsert: true }
                    );
                }
                totalToAdd += quantity * product.price;
                addedCount++;
            }
            if (addedCount === 0) {
                return reply.status(400).send({
                    message: 'No se pudo agregar ningún producto. Puede que no haya stock suficiente.'
                });
            }
            // Actualiza el totalAmount del carrito
            await Cart.updateOne(
                { userId },
                { $inc: { totalAmount: totalToAdd } }
            );
            return reply.send({
                message: 'Pedido repetido con éxito.',
                productosAgregados: addedCount,
                totalAgregado: totalToAdd
            });
        } catch (error) {
            console.error('Error al repetir el pedido:', error);
            return reply.status(500).send({ message: 'Error del servidor' });
        }
    });


}