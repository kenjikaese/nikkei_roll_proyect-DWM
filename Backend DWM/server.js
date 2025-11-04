
/* --- 1. IMPORTACIONES (Librerías y Modelos) --- */

const express = require('express');
const cors = require('cors');
const { ApolloServer, gql, ApolloError } = require('apollo-server-express');
const mongoose = require('mongoose');

const Perfil = require('./models/perfil');
const Cliente = require('./models/cliente');
const Usuario = require('./models/usuario');
const Categoria = require('./models/categoria');
const Producto = require('./models/producto');
const Carrito = require('./models/carrito');
const Pedido = require('./models/pedido');



/* --- 2. INICIALIZACIÓN Y CONEXIÓN A BD --- */

const app = express();
app.use(cors());

mongoose.connect('mongodb://localhost:27017/nikkeidb');



/* --- 3. typeDefs (Esquema de GraphQL) --- */

const typeDefs = gql`
    
    type Response {
        status: String
        message: String
    }

    type Perfil {
        _id: ID
        nombre: String
        descripcion: String
    }

    type Direccion {
        _id: ID
        calle: String
        comuna: String
        region: String
        instrucciones: String
    }

    type Cliente {
        _id: ID
        nombreCompleto: String
        run: String
        fechaNacimiento: String
        sexo: String
        telefono: String
        direcciones: [Direccion]
    }

    type Usuario {
        _id: ID
        email: String
        estado: String
        cliente: Cliente
        perfil: Perfil
    }

    type Categoria {
        _id: ID
        nombre: String
        descripcion: String
    }

    type Producto {
        _id: ID
        nombre: String
        descripcion: String
        precio: Float
        imagenUrl: String
        disponible: Boolean
        categoria: Categoria
    }

    type ItemCarrito {
        _id: ID
        producto: Producto
        cantidad: Int
    }

    type Carrito {
        _id: ID
        cliente: Cliente
        items: [ItemCarrito]
        ultimoAcceso: String
    }

    type ItemPedido {
        _id: ID
        producto: Producto
        cantidad: Int
        precioAlComprar: Float
        nombreProducto: String
    }

    type Pedido {
        _id: ID
        cliente: Cliente
        items: [ItemPedido]
        total: Float
        estado: String
        metodoEntrega: String
        direccionDespacho: Direccion
        fechaCreacion: String
    }

    input DireccionInput {
        calle: String!
        comuna: String!
        region: String!
        instrucciones: String
    }

    input ClienteInput {
        nombreCompleto: String!
        run: String!
        fechaNacimiento: String
        sexo: String
        telefono: String!
        direcciones: [DireccionInput]
    }

    input PerfilInput {
        nombre: String!
        descripcion: String
    }

    input UsuarioInput {
        email: String!
        password: String!
        perfil: ID!
        cliente: ClienteInput!
    }
    
    input CategoriaInput {
        nombre: String!
        descripcion: String
    }

    input ProductoInput {
        nombre: String!
        descripcion: String
        precio: Float!
        imagenUrl: String
        disponible: Boolean
        categoria: ID!
    }

    input ItemInput {
        producto: ID!
        cantidad: Int!
    }

    input PedidoInput {
        items: [ItemInput]!
        total: Float!
        metodoEntrega: String!
        direccionDespacho: DireccionInput!
    }

    type Query {
        getPerfiles: [Perfil]
        
        getUsuarios: [Usuario]
        getUsuario(id: ID!): Usuario
        
        getCliente(id: ID!): Cliente

        getCategorias: [Categoria]

        getProductos: [Producto]
        getProductoById(id: ID!): Producto
        getProductosPorCategoria(categoriaId: ID!): [Producto]
        
        getCarrito(clienteId: ID!): Carrito
        
        getPedidosPorCliente(clienteId: ID!): [Pedido]
        getPedidoById(id: ID!): Pedido
    }

    type Mutation {
        addPerfil(input: PerfilInput): Perfil
        updPerfil(id: ID!, input: PerfilInput): Perfil
        delPerfil(id: ID!): Response

        addUsuario(input: UsuarioInput): Usuario
        updUsuario(id: ID!, input: UsuarioInput): Usuario
        delUsuario(id: ID!): Response
        cambiarEstadoUsuario(id: ID!, estado: String!): Usuario

        agregarDireccion(clienteId: ID!, input: DireccionInput): Cliente
        editarDireccion(clienteId: ID!, direccionId: ID!, input: DireccionInput): Cliente

        addCategoria(input: CategoriaInput): Categoria
        updCategoria(id: ID!, input: CategoriaInput): Categoria
        delCategoria(id: ID!): Response
        
        addProducto(input: ProductoInput): Producto
        updProducto(id: ID!, input: ProductoInput): Producto
        delProducto(id: ID!): Response
        updDisponibilidad(id: ID!, disponible: Boolean!): Producto

        agregarItemAlCarrito(clienteId: ID!, input: ItemInput): Carrito
        actualizarItemEnCarrito(clienteId: ID!, itemId: ID!, nuevaCantidad: Int!): Carrito
        eliminarItemDelCarrito(clienteId: ID!, itemId: ID!): Carrito

        crearPedido(clienteId: ID!, input: PedidoInput): Pedido
        actualizarEstadoPedido(id: ID!, estado: String!): Pedido
        solicitarAnulacion(id: ID!, motivo: String): Pedido
    }
`;



/* --- 4. resolvers (Lógica de la API) --- */

const resolvers = {
    Query: {
        /* --- Resolvers de Perfil --- */
        getPerfiles: async () => {
            return await Perfil.find();
        },

        /* --- Resolvers de Usuario --- */
        getUsuarios: async () => {
            return await Usuario.find().populate('cliente').populate('perfil');
        },
        getUsuario: async (_, { id }) => {
            const usuario = await Usuario.findById(id).populate('cliente').populate('perfil');
            if (!usuario) {
                throw new ApolloError('Usuario no encontrado', 'NOT_FOUND');
            }
            return usuario;
        },

        /* --- Resolvers de Cliente --- */
        getCliente: async (_, { id }) => {
            const cliente = await Cliente.findById(id);
            if (!cliente) {
                throw new ApolloError('Cliente no encontrado', 'NOT_FOUND');
            }
            return cliente;
        },

        /* --- Resolvers de Categoria --- */
        getCategorias: async () => {
            return await Categoria.find();
        },

        /* --- Resolvers de Producto --- */
        getProductos: async () => {
            return await Producto.find().populate('categoria');
        },
        getProductoById: async (_, { id }) => {
            const producto = await Producto.findById(id).populate('categoria');
            if (!producto) {
                throw new ApolloError('Producto no encontrado', 'NOT_FOUND');
            }
            return producto;
        },
        getProductosPorCategoria: async (_, { categoriaId }) => {
            return await Producto.find({ categoria: categoriaId }).populate('categoria');
        },
        
        /* --- Resolvers de Carrito --- */
        getCarrito: async (_, { clienteId }) => {
            const carrito = await Carrito.findOne({ cliente: clienteId }).populate('cliente').populate('items.producto');
            if (!carrito) {
                throw new ApolloError('Carrito no encontrado para este cliente', 'NOT_FOUND');
            }
            return carrito;
        },
        
        /* --- Resolvers de Pedido --- */
        getPedidosPorCliente: async (_, { clienteId }) => {
            return await Pedido.find({ cliente: clienteId }).populate('cliente').populate('items.producto');
        },
        getPedidoById: async (_, { id }) => {
            const pedido = await Pedido.findById(id).populate('cliente').populate('items.producto');
            if (!pedido) {
                throw new ApolloError('Pedido no encontrado', 'NOT_FOUND');
            }
            return pedido;
        }
    },

    Mutation: {
        /* --- Mutaciones de Perfil --- */
        addPerfil: async (_, { input }) => {
            try {
                const perfil = new Perfil(input);
                await perfil.save();
                return perfil;
            } catch (error) {
                throw new ApolloError(error.message, 'VALIDATION_ERROR');
            }
        },
        updPerfil: async (_, { id, input }) => {
            return await Perfil.findByIdAndUpdate(id, input, { new: true, runValidators: true });
        },
        delPerfil: async (_, { id }) => {
            await Perfil.deleteOne({ _id: id });
            return { status: "200", message: "Perfil Eliminado" };
        },

        /* --- Mutaciones de Usuario --- */
        addUsuario: async (_, { input }) => {
            try {
                const perfilBus = await Perfil.findById(input.perfil);
                if (!perfilBus) {
                    throw new ApolloError('Perfil seleccionado no existe', 'BAD_USER_INPUT');
                }
                
                const cliente = new Cliente(input.cliente);
                await cliente.save();
                
                const usuario = new Usuario({
                    email: input.email,
                    password: input.password,
                    cliente: cliente._id,
                    perfil: perfilBus._id
                });
                await usuario.save();
                return await usuario.populate(['cliente', 'perfil']);

            } catch (error) {
                throw new ApolloError(error.message, 'VALIDATION_ERROR');
            }
        },
        updUsuario: async (_, { id, input }) => {
            return await Usuario.findByIdAndUpdate(id, input, { new: true, runValidators: true });
        },
        delUsuario: async (_, { id }) => {
            await Usuario.deleteOne({ _id: id });
            return { status: "200", message: "Usuario Eliminado" };
        },
        cambiarEstadoUsuario: async (_, { id, estado }) => {
            return await Usuario.findByIdAndUpdate(id, { estado: estado }, { new: true, runValidators: true });
        },

        /* --- Mutaciones de Cliente --- */
        agregarDireccion: async (_, { clienteId, input }) => {
            return await Cliente.findByIdAndUpdate(
                clienteId,
                { $push: { direcciones: input } },
                { new: true, runValidators: true }
            );
        },
        editarDireccion: async (_, { clienteId, direccionId, input }) => {
            return await Cliente.findOneAndUpdate(
                { _id: clienteId, "direcciones._id": direccionId },
                { $set: { "direcciones.$": input } },
                { new: true, runValidators: true }
            );
        },

        /* --- Mutaciones de Categoria --- */
        addCategoria: async (_, { input }) => {
            try {
                const categoria = new Categoria(input);
                await categoria.save();
                return categoria;
            } catch (error) {
                throw new ApolloError(error.message, 'VALIDATION_ERROR');
            }
        },
        updCategoria: async (_, { id, input }) => {
            return await Categoria.findByIdAndUpdate(id, input, { new: true, runValidators: true });
        },
        delCategoria: async (_, { id }) => {
            await Categoria.deleteOne({ _id: id });
            return { status: "200", message: "Categoría Eliminada" };
        },
        
        /* --- Mutaciones de Producto --- */
        addProducto: async (_, { input }) => {
            try {
                const producto = new Producto(input);
                await producto.save();
                return producto.populate('categoria');
            } catch (error) {
                throw new ApolloError(error.message, 'VALIDATION_ERROR');
            }
        },
        updProducto: async (_, { id, input }) => {
            return await Producto.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate('categoria');
        },
        delProducto: async (_, { id }) => {
            await Producto.deleteOne({ _id: id });
            return { status: "200", message: "Producto Eliminado" };
        },
        updDisponibilidad: async (_, { id, disponible }) => {
            return await Producto.findByIdAndUpdate(id, { disponible: disponible }, { new: true });
        },

        /* --- Mutaciones de Carrito --- */
        agregarItemAlCarrito: async (_, { clienteId, input }) => {
            const carrito = await Carrito.findOne({ cliente: clienteId });
            if (!carrito) {
                throw new ApolloError('Carrito no encontrado', 'NOT_FOUND');
            }
            carrito.items.push(input);
            await carrito.save();
            return carrito.populate('cliente').populate('items.producto');
        },
        actualizarItemEnCarrito: async (_, { clienteId, itemId, nuevaCantidad }) => {
            return await Carrito.findOneAndUpdate(
                { cliente: clienteId, "items._id": itemId },
                { $set: { "items.$.cantidad": nuevaCantidad } },
                { new: true, runValidators: true }
            ).populate('cliente').populate('items.producto');
        },
        eliminarItemDelCarrito: async (_, { clienteId, itemId }) => {
            return await Carrito.findOneAndUpdate(
                { cliente: clienteId },
                { $pull: { items: { _id: itemId } } },
                { new: true }
            ).populate('cliente').populate('items.producto');
        },

        /* --- Mutaciones de Pedido --- */
        crearPedido: async (_, { clienteId, input }) => {
            try {
                const pedido = new Pedido({
                    cliente: clienteId,
                    items: input.items,
                    total: input.total,
                    metodoEntrega: input.metodoEntrega,
                    direccionDespacho: input.direccionDespacho
                });
                await pedido.save();
                return pedido.populate('cliente').populate('items.producto');
            } catch (error) {
                throw new ApolloError(error.message, 'VALIDATION_ERROR');
            }
        },
        actualizarEstadoPedido: async (_, { id, estado }) => {
            return await Pedido.findByIdAndUpdate(id, { estado: estado }, { new: true, runValidators: true });
        },
        solicitarAnulacion: async (_, { id, motivo }) => {
            return await Pedido.findByIdAndUpdate(id, { estado: "Cancelado" }, { new: true });
        }
    }
};



/* --- 5. INICIO DEL SERVIDOR (Bootstrapping) --- */

let apolloServer = null;

async function startServer() {
    apolloServer = new ApolloServer({ typeDefs, resolvers });
    await apolloServer.start();
    
    apolloServer.applyMiddleware({ app, cors: false });
    
    app.listen(8092, function() {
        console.log('Servidor Express iniciado en el puerto 8092');
        console.log(`Servidor GraphQL listo en http://localhost:8092${apolloServer.graphqlPath}`);
    });
}

startServer();