import Product from '../models/product.model.js';
export default async function productosRoutes(fastify, opts) {

  fastify.addHook('preHandler', async (request, reply) => {
    request.log.info(`Operación en productos: ${request.method} ${request.url}`);
  });

  function validarProducto(producto) {
    const errores = [];

    if (!producto.name || typeof producto.name !== 'string') {
      errores.push('Nombre inválido');
    }
    if (!producto.price || typeof producto.price !== 'number' || producto.price <= 0) {
      errores.push('Precio inválido');
    }
    if (!producto.category || typeof producto.category !== 'string') {
      errores.push('Categoría inválida');
    }
    if (!producto.origin || typeof producto.origin !== 'string') {
      errores.push('Origen inválido');
    }
    if (!producto.stock || typeof producto.stock !== 'number' || producto.stock < 0) {
      errores.push('Stock inválido');
    }
    if (!producto.description || typeof producto.description !== 'string') {
      errores.push('Descripción inválida');
    }
    if (!producto.story || typeof producto.story !== 'string') {
      errores.push('Historia inválida');
    }
    return errores;
  }

   // Crear nuevo producto
  fastify.post('/', async (request, reply) => {
    const { name, price, category, origin, stock, description, story } = request.body;

    const nuevoProducto = new Product({
      name,
      price: parseFloat(price),
      category,
      origin,
      stock: parseInt(stock, 10),
      description,
      story
    });

    const errores = validarProducto(nuevoProducto);

    if (errores.length > 0) {
      return reply.code(400).send({
        error: 'ERRORES EN LA VALIDACIÓN',
        errores,
        status: 'error'
      });
    }

    await nuevoProducto.save();

    return {
      producto: nuevoProducto,
      mensaje: 'Producto creado correctamente',
      status: 'success'
    };
  });

  fastify.get('/', async (request, reply) => {
    const productos = await Product.find();
    return {
      productos,
      mensaje: 'Productos obtenidos correctamente',
      status: 'success'
    };
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const producto = await Product.findById(id);

    if (!producto) {
      return reply.code(404).send({
        error: 'Producto no encontrado',
        status: 'error'
      });
    }

    return {
      producto,
      mensaje: 'Producto obtenido correctamente',
      status: 'success'
    };
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, price, category, origin, stock, description, story } = request.body;

    const productoActualizado = await Product.findByIdAndUpdate(id, {
      name,
      price: parseFloat(price),
      category,
      origin,
      stock: parseInt(stock, 10),
      description,
      story
    }, { new: true });

    if (!productoActualizado) {
      return reply.code(404).send({
        error: 'Producto no encontrado',
        status: 'error'
      });
    }

    return {
      producto: productoActualizado,
      mensaje: 'Producto actualizado correctamente',
      status: 'success'
    };
  });
}