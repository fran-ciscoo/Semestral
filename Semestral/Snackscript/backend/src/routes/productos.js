export default async function productosRoutes(fastify, opts) {

  fastify.addHook('preHandler', async (request, reply) => {
    request.log.info(`Operación en productos: ${request.method} ${request.url}`);
  });

  function validarProducto(producto) {
    const errores = [];

    if (!producto.nombre || typeof producto.nombre !== 'string') {
      errores.push('Nombre inválido');
    }
    if (!producto.precio || typeof producto.precio !== 'number' || producto.precio <= 0) {
      errores.push('Precio inválido');
    }
    if (!producto.categoria || typeof producto.categoria !== 'string') {
      errores.push('Categoría inválida');
    }
    return errores;
  }

  // Ver todos los productos
  fastify.get('/', async (request, reply) => {
    const productos = await Producto.find().populate('categoria');
    return productos;
  });

  // Ver producto por ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const producto = await Producto.findById(id).populate('categoria');
      if (!producto) {
        return reply.status(404).send({ error: 'Producto no encontrado' });
      }
      return producto;
    } catch (error) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
  });

  // Crear nuevo producto
  fastify.post('/', async (request, reply) => {
    const { nombre, precio, categoria } = request.body;

    const nuevoProducto = new Producto({
      nombre,
      precio: parseFloat(precio),
      categoria
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

  // Actualizar producto por ID
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { nombre, precio, categoria } = request.body;

    const productoActualizado = {
      nombre,
      precio: parseFloat(precio),
      categoria
    };

    const errores = validarProducto(productoActualizado);
    if (errores.length > 0) {
      return reply.code(400).send({
        error: 'ERRORES EN LA VALIDACIÓN',
        errores,
        status: 'error'
      });
    }

    try {
      const producto = await Producto.findByIdAndUpdate(id, productoActualizado, { new: true });
      if (!producto) {
        return reply.status(404).send({ error: 'Producto no encontrado' });
      }

      return {
        producto,
        mensaje: 'Producto actualizado correctamente',
        status: 'success'
      };
    } catch (error) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
  });

  // Eliminar producto por ID
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const producto = await Producto.findByIdAndDelete(id);
      if (!producto) {
        return reply.status(404).send({ error: 'Producto no encontrado' });
      }

      return {
        mensaje: 'Producto eliminado correctamente',
        status: 'success'
      };
    } catch (error) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
  });
}