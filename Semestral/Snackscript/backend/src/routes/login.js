import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Session from '../models/session.model.js';

const secretKey = 'clave_secreta_segura_y_larga';
export default async function loginRoutes(fastify, opts) {

fastify.post('/', async (request, reply) => {
  try {
    const { username, password } = request.body;

    const user = await User.findOne({ username });
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    if (user.password !== String(password)) {
      return reply.status(401).send({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      secretKey,
      { expiresIn: '1h' }
    );

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const newSession = new Session({
      userId: user._id,
      token,
      expiresAt
    });

    await newSession.save();

    reply
      .setCookie('token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: false, // true si usas HTTPS
        maxAge: 3600,
      })
      .send({ message: 'Login successful', user });

  } catch (error) {
    console.error('Error en login:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
});


fastify.get('/me', async (request, reply) => {
    const token = request.cookies.token;
    if (!token) return reply.status(401).send({ error: 'No token provided' });

    try {
      const decoded = jwt.verify(token, secretKey);

      const session = await Session.findOne({ token, isActive: true });
      if (!session || session.expiresAt < new Date()) {
        return reply.status(401).send({ error: 'Session expired or invalid' });
      }

      const user = await User.findById(decoded.id).select('-password');
      return reply.send({ user });

    } catch (err) {
      return reply.status(401).send({ error: 'Invalid token' });
    }
});

fastify.post('/logout', async (request, reply) => {
    const token = request.cookies.token;
    if (!token) return reply.send({ message: 'Already logged out' });

    await Session.findOneAndUpdate({ token }, { isActive: false });

    reply
      .clearCookie('token', { path: '/' })
      .send({ message: 'Logged out successfully' });
  });
}