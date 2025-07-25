import Cart from '../models/cart.model.js';
import jwt from 'jsonwebtoken';
const secretKey = 'clave_secreta_segura_y_larga';
export default async function cartRoutes(fastify, opts) {
    fastify.post('/', async (request, reply) => {
        try {
            const token = request.cookies.token;
            const decoded = jwt.verify(token, secretKey);
            const {productId} = request.body;

            if (!productId) {
                return reply.status(400).send({ message: 'El productId no se esta disponible.' });
            }
            let cart = await Cart.findOne({ userId: decoded.id });
            if (!cart) {
                cart = new Cart({
                    userId: decoded.id,
                    items: [{ product: productId, quantity: 1}]
                });
            } else {
                const existingItem = cart.items.find(item => item.product.toString() === productId);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.items.push({ product: productId, quantity: 1 });
                }
            }
            await cart.save();
            return reply.status(200).send({ message: 'Producto agregado al carrito', cart });
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            reply.status(500).send({ message: 'Error interno del servidor' });
        }
    });
    fastify.get('/cart', async (request, reply) => {
        try {
            const token = request.cookies.token;
            if (!token) {
                return reply.status(401).send({ message: 'No autorizado' });
            }

            const decoded = jwt.verify(token, secretKey);

            const cart = await Cart.findOne({ userId: decoded.id }).populate('items.product');
            if (!cart) {
                return reply.status(404).send({ message: 'Carrito no encontrado' });
            }

            return reply.send({ cart });
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            reply.status(500).send({ message: 'Error interno del servidor' });
        }
    });
    fastify.delete('/delete/:productId', async (request, reply) => {
        try {
            const token = request.cookies.token;
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;
            const productId = request.params.productId;
            if (!productId) {
                return reply.status(400).send({ message: 'Falta el productId en la URL.' });
            }
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                return reply.status(404).send({ message: 'Carrito no encontrado.' });
            }
            cart.items = cart.items.filter(item => item.product.toString() !== productId);
            await cart.save();
            return reply.status(200).send({ message: 'Producto eliminado del carrito', cart });
        } catch (error) {
            console.error('Error al eliminar producto del carrito:', error);
            return reply.status(500).send({ message: 'Error interno del servidor' });
        }
    });
    fastify.put('/update/:productId', async (request, reply) => {
        try {
            const token = request.cookies.token;
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;
            const productId = request.params.productId;
            const { quantity } = request.body;

            if (!productId || typeof quantity !== 'number') {
                return reply.status(400).send({ message: 'Faltan datos necesarios (productId o quantity).' });
            }

            const cart = await Cart.findOne({ userId });
            if (!cart) {
                return reply.status(404).send({ message: 'Carrito no encontrado.' });
            }

            const item = cart.items.find(item => item.product.toString() === productId);
            if (!item) {
                return reply.status(404).send({ message: 'Producto no encontrado en el carrito.' });
            }

            item.quantity = quantity;
            await cart.save();

            return reply.status(200).send({ message: 'Cantidad actualizada correctamente.', cart });
        } catch (error) {
            console.error('Error al actualizar cantidad del producto:', error);
            return reply.status(500).send({ message: 'Error interno del servidor' });
        }
    });
}