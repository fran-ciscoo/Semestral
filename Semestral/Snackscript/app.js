import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { connect } from './backend/config/database.js';
import fastifyCookie from '@fastify/cookie';

const PORT = 3000;
const MONGO_URI = 'mongodb://root:example@localhost:27017/';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const fastify = Fastify({
    logger: {
        level: 'info'
    }   
});

fastify.register(fastifyStatic, {
  root: path.join(dirname, 'frontend'),
  prefix: '/',
});

fastify.get('/', async (request, reply) => {
  return reply.sendFile('view/index.html');
});

async function routesUsers() {
  await fastify.register(import('./backend/src/routes/users.js'), {
    prefix: '/api/users'
  })
}
routesUsers();

fastify.register(fastifyCookie);
async function routesLogin() {
  await fastify.register(import('./backend/src/routes/login.js'), {
    prefix: '/api/login'
  })
}
routesLogin();

const start = async () => {
    try {
        await connect(MONGO_URI);
        await fastify.listen({ port: PORT });
        console.log(`🔥Esta corriendo en http://localhost:3000`);
        } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
start();