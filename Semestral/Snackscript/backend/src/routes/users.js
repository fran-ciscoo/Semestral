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

}