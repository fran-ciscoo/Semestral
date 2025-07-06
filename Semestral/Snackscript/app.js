import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

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

const start = async () => {
    try {
        await fastify.listen({ 
            port: 3000 
        });
        console.log(`🔥Esta corriendo en http://localhost:3000`);
            } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
start();