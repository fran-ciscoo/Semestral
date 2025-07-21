import Product from '../models/product.model.js';
import cloudinary from '../../config/cloudinary.js';

export default async function productosRoutes(fastify, opts) {

  fastify.addHook('preHandler', async (request, reply) => {
    request.log.info(`Operación en productos: ${request.method} ${request.url}`);
  });

   // Crear nuevo producto
  fastify.post('/', async (request, reply) => {
    const parts = request.parts();

    const formFields = {};
    let imageUrl = '';

    try {
      for await (const part of parts) {
        if (part.type === 'field') {
          formFields[part.fieldname] = part.value;
        }

        if (part.type === 'file' && part.fieldname === 'productImage') {
          imageUrl = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'ecommerce-snacks' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            part.file.pipe(stream);
          });
          console.log('Imagen subida a Cloudinary:', imageUrl);
        }
      }

      const productoExistente = await Product.findOne({ name: formFields.productName });
      if (productoExistente) {
        return reply.code(400).send({
          message: 'Ya existe un producto con ese nombre',
          status: 'error',
        });
      }

      const nuevoProducto = new Product({
        name: formFields.productName,
        price: parseFloat(formFields.productPrice),
        category: formFields.productCategory,
        origin: formFields.productOrigin,
        stock: parseInt(formFields.productStock, 10),
        description: formFields.productDescription,
        story: formFields.productStory,
        image: imageUrl,
      });

      await nuevoProducto.save();

      return reply.code(201).send({
        producto: nuevoProducto,
        mensaje: 'Producto creado correctamente',
        status: 'success',
      });

    } catch (err) {
      console.error('Error en la creación del producto:', err);
      return reply.code(500).send({
        error: 'Error interno del servidor',
        detalle: err.message,
        status: 'error',
      });
    }
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