import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import jwt from 'jsonwebtoken';
const secretKey = 'clave_secreta_segura_y_larga';
export default async function cartRoutes(fastify, opts) {
    fastify.post('/', async (request, reply) => {
        try {
            const token = request.cookies.token;
            const decoded = jwt.verify(token, secretKey);
            const { productId } = request.body;
            if (!productId) {
                return reply.status(400).send({ message: 'El productId no se está enviando.' });
            }
            const product = await Product.findById(productId);
            if (!product) {
                return reply.status(404).send({ message: 'Producto no encontrado' });
            }
            let cart = await Cart.findOne({ userId: decoded.id });
            if (!cart) {
                cart = new Cart({
                    userId: decoded.id,
                    items: [{ product: productId, quantity: 1,  price: product.price}],
                    totalAmount: product.price
                });
            } else {
                const existingItem = cart.items.find(item =>
                    item.product.toString() === productId && !item.isFree
                );
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.items.push({ product: productId, quantity: 1, price: product.price});
                }
                cart.totalAmount = 0;
                for (const item of cart.items) {
                    cart.totalAmount += item.price * item.quantity;
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
            cart.items = cart.items.filter(item => {
                return !(item.product.toString() === productId && !item.isFree);
            });
            cart.totalAmount = 0;
            for (const item of cart.items) {
                cart.totalAmount += item.price * item.quantity;
            }
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
            cart.totalAmount = 0;
            for (const item of cart.items) {
                cart.totalAmount += item.price * item.quantity;
            }

            await cart.save();

            return reply.status(200).send({ message: 'Cantidad actualizada correctamente.', cart });
        } catch (error) {
            console.error('Error al actualizar cantidad del producto:', error);
            return reply.status(500).send({ message: 'Error interno del servidor' });
        }
    });

    fastify.put('/clear', async (request, reply) => {
        try {
            const token = request.cookies.token;
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                return reply.status(404).send({ message: 'No se encontró un carrito para este usuario.' });
            }
            cart.items = [];
            cart.totalAmount = 0;
            await cart.save();
            return reply.status(200).send({ message: 'Carrito vaciado correctamente.' });
        } catch (error) {
            console.error('Error al vaciar el carrito:', error);
            return reply.status(500).send({ message: 'Error al vaciar el carrito.' });
        }
    });
    fastify.post('/free-product', async (request, reply) => {
        const { productId } = request.body;
        const token = request.cookies.token;

        try {
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;
            let cart = await Cart.findOne({ userId: userId });
            const alreadyFree = cart.items.some(item =>
                item.product.toString() === productId && item.isFree
            );

            if (alreadyFree) {
                return reply.code(200).send({
                    success: false,
                    message: 'Este producto gratuito ya está en tu carrito'
                });
            }
            const product = await Product.findById(productId);
            if (!product) {
                return reply.code(404).send({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            cart.items.push({
                product: product._id,
                quantity: 1,
                price: 0,
                isFree: true
            });
            await cart.save();
            return reply.code(200).send({
                productName: product.name
            });

        } catch (error) {
            console.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Error al agregar el producto gratuito al carrito'
            });
        }
    });
    fastify.delete('/remove-free-product/:productId', async (request, reply) => {
        try {
            const { productId } = request.params;
            const token = request.cookies.token;
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;
            const cart = await Cart.findOne({ userId: userId });
            if (!cart) {
                return reply.status(404).send({ message: 'Carrito no encontrado' });
            }
            const originalLength = cart.items.length;
            cart.items = cart.items.filter(item =>
                !(item.product.toString() === productId && item.isFree)
            );
            if (cart.items.length === originalLength) {
                return reply.status(404).send({ message: 'Producto gratuito no estaba en el carrito' });
            }
            await cart.save();
            return reply.send({ message: 'Producto gratuito eliminado del carrito' });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Error interno del servidor' });
        }
    });

}