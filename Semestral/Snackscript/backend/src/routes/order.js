import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Cart from '../models/cart.model.js';
import jwt from 'jsonwebtoken';
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

fastify.post('/', async (request, reply) => {
        try {
            const token = request.cookies.token;
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;
            const {totalAmount} = request.body;

            const user = await User.findById(userId).select('-password');
            const cart = await Cart.findOne({ userId }).populate('items.product');

            if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
                return reply.status(400).send({ message: 'El carrito está vacío.' });
            }
            const items = cart.items.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.price
            }));
            
            const newOrder = await Order.create({
                userId,
                items,
                shippingAddress: user.shippingAddress,
                paymentMethod: 'stripe',
                totalAmount: totalAmount,
                subtotal: cart.totalAmount
            });

            return reply.status(201).send({ message: 'Orden creada exitosamente.', order: newOrder });
        } catch (error) {
            console.error('Error al crear la orden:', error);
            return reply.status(500).send({ message: 'Error interno del servidor.' });
        }
    });
}