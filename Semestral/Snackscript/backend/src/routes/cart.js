import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
            const item = cart.items.find(item => item.product.toString() === productId);
            if (!item) {
                return reply.status(404).send({ message: 'Producto no encontrado en el carrito.' });
            }
            const product = await Product.findById(productId);
            if (!product) {
                return reply.status(404).send({ message: 'Producto no existe en la base de datos.' });
            }
            
            if (quantity > product.stock) {
                return reply.status(400).send({
                    message: `No puedes añadir más de ${product.stock} unidades de este producto.`,
                    error: 'outStock',
                });
            }
            item.quantity = quantity;
            cart.totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
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
    fastify.post('/create-checkout-session', async (request, reply) => {
        try {
            const domainURL = request.headers.origin || 'http://localhost:3000';
            const token = request.cookies.token;
            if (!token) {
                return reply.status(401).send({ message: 'No autorizado: falta el token' });
            }
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;
            const cart = await Cart.findOne({ userId }).populate('items.product').populate('coupon');
            if (!cart || cart.items.length === 0) {
                return reply.status(400).send({ message: 'El carrito está vacío' });
            }
            const line_items = cart.items
                .filter(item => !item.isFree)
                .map(item => ({
                    price: item.product.stripeId,
                    quantity: item.quantity,
                }));
            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                line_items,
                ...(cart.coupon && {
                    discounts: [{
                        coupon: cart.coupon.couponIdStripe,
                    }]
                }),
                success_url: `${domainURL}/view/carrito.html?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${domainURL}/view/carrito.html?session_id={CHECKOUT_SESSION_ID}`,
            });
            return reply.send({ url: session.url });
        } catch (error) {
            console.error('Error al crear la sesión de pago:', error);
            return reply.status(500).send({ message: 'Error al crear la sesión de Stripe' });
        }
    });
    fastify.put('/coupon', async (request, reply) => {
        try {
            const token = request.cookies.token;
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id;
            const {couponId} = request.body;
            if (!userId) {
                return reply.status(400).send({ message: 'Falta el userId' });
            }
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                return reply.status(404).send({ message: 'Carrito no encontrado para el usuario' });
            }
            cart.coupon = couponId || null;
            await cart.save();
            return reply.send({ message: 'Cupón actualizado correctamente', cart });
        } catch (error) {
            console.error('Error actualizando el cupón:', error);
            return reply.status(500).send({ message: 'Error actualizando el cupón del carrito' });
        }
    });

}