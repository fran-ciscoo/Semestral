import Order from '../models/order.model.js';

export default async function orderRoutes(fastify, reply) {

fastify.get('/', async (request, reply) => {
    const {status} = request.params;

    if (!status){
        return reply.status(400).send({error: 'Estatus no encontrado'});
    }

    try {
        const order = await Order.find({status});
        return reply.status(200).send({order});
    } catch(error){
        console.error('Error al buscar: ', error);
        return reply.status(500).send({error: 'Error en el server'});
    }
});


}