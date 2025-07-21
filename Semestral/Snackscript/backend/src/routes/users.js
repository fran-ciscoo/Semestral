import User from '../models/user.model.js';
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

}