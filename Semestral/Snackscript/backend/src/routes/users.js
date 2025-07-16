import User from '../models/user.model.js';
export default async function usersRoutes(fastify, opts) {

fastify.post('/users', async (request, reply) => {
    const { name, username, email, password } = request.body;

    // Create new user
    const newUser = new User({
        name,
        username,
        email,
        password
    });

    try {
        await newUser.save();
        return reply.status(201).send({ message: 'User created successfully.' });
    } catch (error) {
        return reply.status(500).send({ error: 'Internal server error.' });
    }
});

}