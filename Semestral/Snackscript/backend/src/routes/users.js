import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import jwt from 'jsonwebtoken';
const secretKey = 'clave_secreta_segura_y_larga';
export default async function usersRoutes(fastify, opts) {

fastify.post('/', async (request, reply) => {
    const { name, username, email, password } = request.body;

    try {
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return reply.status(400).send({
                error: 'El nombre de usuario ya está en uso.',
                field: 'username'
            });
        }
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return reply.status(400).send({
                error: 'El correo electrónico ya está registrado.',
                field: 'email'
            });
        }
        const newUser = new User({ name, username, email, password });
        await newUser.save();

        return reply.status(201).send({ message: 'Usuario creado exitosamente.' });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        return reply.status(500).send({ error: 'Error interno del servidor.' });
    }
});

fastify.get('/', async (request, reply) => {
    try {
        const users = await User.find({}, '-password');
        return reply.status(200).send(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return reply.status(500).send({ error: 'Error interno del servidor.' });
    }
});

fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    try {
        const user = await User.findById(id, '-password');
        if (!user) {
            return reply.status(404).send({ error: 'Usuario no encontrado.' });
        }
        return reply.status(200).send(user);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return reply.status(500).send({ error: 'Error interno del servidor.' });
    }
});

fastify.get('/role', async (request, reply) => {
    const { role } = request.query;

    if (!role) {
        return reply.status(400).send({ error: 'El parámetro "role" es requerido.' });
    }

    try {
        const users = await User.find({ role }, '-password');
        return reply.status(200).send(users);
    } catch (error) {
        console.error('Error al obtener usuarios por rol:', error);
        return reply.status(500).send({ error: 'Error interno del servidor.' });
    }
});

fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { role } = request.body;

    console.log('Datos recibidos para actualizar:', request.body);

    if (!role) {
        return reply.status(400).send({ error: 'El campo "role" es requerido.' });
    }

    try {
        const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
        if (!user) {
            return reply.status(404).send({ error: 'Usuario no encontrado.' });
        }
        return reply.status(200).send({ message: 'Rol actualizado exitosamente.', user });
    } catch (error) {
        console.error('Error al actualizar rol de usuario:', error);
        return reply.status(500).send({ error: 'Error interno del servidor.' });}
});

fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, email, shippingAddress, phone } = request.body;

    try {
        const user = await User.findByIdAndUpdate(id, { name, email, shippingAddress, phone }, { new: true, runValidators: true });
        if (!user) {
            return reply.status(404).send({ error: 'Usuario no encontrado.' });
        }
        return reply.status(200).send({ message: 'Perfil actualizado exitosamente.', user });
    } catch (error) {
        console.error('Error al actualizar perfil de usuario:', error);
        return reply.status(500).send({ error: 'Error interno del servidor.' });
    }
});

fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return reply.status(404).send({ error: 'Usuario no encontrado.' });
        }
        return reply.status(200).send({ message: 'Usuario eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return reply.status(500).send({ error: 'Error interno del servidor.' });
    }
});

fastify.get('/address', async (request, reply) => {
    try {
        const token = request.cookies.token;
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.id;

        const user = await User.findById(userId).select('shippingAddress');
        if (!user.shippingAddress.city) {
            return reply.status(400).send({ message: 'Por favor completa tu dirección de envío en tu perfil.', error: 'noAddress' });
        }

        return reply.status(200).send({ shippingAddress: user.shippingAddress });
    } catch (error) {
        console.error('Error al obtener la dirección:', error);
        return reply.status(500).send({ message: 'Error interno del servidor.' });
    }
});
fastify.post('/favorites/:productId', async (request, reply) => {
    try {
        const token = request.cookies.token;
        if (!token) {
            return reply.status(401).send({ message: 'No autorizado. Inicia sesión.' });
        }
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.id;
        const { productId } = request.params;
        const product = await Product.findById(productId);
        if (!product) {
            return reply.status(404).send({ message: 'Producto no encontrado.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return reply.status(404).send({ message: 'Usuario no encontrado.' });
        }
        const index = user.favProducts.indexOf(productId);

        if (index > -1) {
            user.favProducts.splice(index, 1);
            await user.save();
            return reply.status(200).send({ message: 'Producto eliminado de favoritos.' });
        } else {
            user.favProducts.push(productId);
            await user.save();
            return reply.status(200).send({ message: 'Producto agregado a favoritos.' });
        }
    } catch (error) {
        console.error('Error al agregar a favoritos:', error);
        return reply.status(500).send({ message: 'Error interno del servidor.' });
    }
});

fastify.get('/favorites', async (request, reply) => {
    try {
        const token = request.cookies.token;
        if (!token) {
            return reply.status(401).send({ message: 'No autorizado. Inicia sesión.' });
        }

        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.id;

        const user = await User.findById(userId).populate('favProducts');
        if (!user) {
            return reply.status(404).send({ message: 'Usuario no encontrado.' });
        }

        return reply.status(200).send({
            favorites: user.favProducts
        });

    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        return reply.status(500).send({ message: 'Error interno del servidor.' });
    }
});
}