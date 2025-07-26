import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { connect } from './backend/config/database.js';
import fastifyCookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
dotenv.config();
const PORT = 3000;
const MONGO_URI = 'mongodb://root:example@localhost:27017/';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const fastify = Fastify({
    logger: {
        level: 'info'
    }   
});
fastify.register(fastifyCookie);
fastify.register(multipart);
fastify.register(fastifyStatic, {
  root: path.join(dirname, 'frontend'),
  prefix: '/',
});

fastify.get('/', async (request, reply) => {
    return reply.sendFile('view/index.html'); 
});

async function routesProducts() {
  await fastify.register(import('./backend/src/routes/productos.js'), {
    prefix: '/api/productos'
  });
}
routesProducts();

async function routesUsers() {
  await fastify.register(import('./backend/src/routes/users.js'), {
    prefix: '/api/users'
  })
}
routesUsers();


async function routesLogin() {
  await fastify.register(import('./backend/src/routes/login.js'), {
    prefix: '/api/login'
  })
}
routesLogin();

async function routesCart() {
  await fastify.register(import('./backend/src/routes/cart.js'), {
    prefix: '/api/cart'
  })
}
routesCart();

async function orderRoutes() {
  await fastify.register(import('./backend/src/routes/order.js'), {
    prefix: '/api/order'
  })
}
orderRoutes();

async function pointsRoutes() {
  await fastify.register(import('./backend/src/routes/points.js'), {
    prefix: '/api/points'
  })
}
pointsRoutes();

async function couponRoutes() {
  await fastify.register(import('./backend/src/routes/coupon.js'), {
    prefix: '/api/coupon'
  })
}
couponRoutes();

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