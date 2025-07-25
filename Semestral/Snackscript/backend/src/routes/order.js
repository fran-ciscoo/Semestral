import Order from '../models/order.model.js';

export default async function orderRoutes(fastify, reply) {

fastify.get('/status/:status', async (request, reply) => {
    const {status} = request.params;

    if (!status){
        return reply.status(400).send({error: 'Estatus no encontrado'});
    }

    try {
        const orders = await Order.find({status}).populate('userId');
        return reply.status(200).send({orders});
    } catch(error){
        console.error('Error al buscar: ', error);
        return reply.status(500).send({error: 'Error en el server'});
    }
});

fastify.get('/', async (request, reply) => {
    const {status} = request.query;

    if (!status){
        try {
        const orders = await Order.find().populate('userId');
        return reply.status(200).send({orders});
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        return reply.status(500).send({error: 'Error en el servidor'});
    }
    }else{
        try {
        const orders = await Order.find({status}).populate('userId');
        return reply.status(200).send({orders});
    } catch(error){
        console.error('Error al buscar: ', error);
        return reply.status(500).send({error: 'Error en el server'});
    }
    }
});

fastify.put('/:id', async (request, reply) => {
    const {id} = request.params;
    const {status} = request.body;

    if (!id || !status) {
        return reply.status(400).send({error: 'ID o estatus no proporcionados'});
    }

    try {
        const order = await Order.findByIdAndUpdate(id, {status}, {new: true});
        if (!order) {
            return reply.status(404).send({error: 'Pedido no encontrado'});
        }
        return reply.status(200).send(order);
    } catch (error) {
        console.error('Error al actualizar el pedido:', error);
        return reply.status(500).send({error: 'Error en el servidor'});
    }
});
}