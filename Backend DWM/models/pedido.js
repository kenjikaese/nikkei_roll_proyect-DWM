const mongoose = require('mongoose');

/* --- Sub-documento DireccionPedido --- */
const direccionPedidoSchema = new mongoose.Schema({
    calle: { type: String, required: true },
    comuna: { type: String, required: true },
    region: { type: String, required: true },
    instrucciones: String
});

/* --- Sub-documento ItemPedido --- */
const itemPedidoSchema = new mongoose.Schema({
    producto: { type: mongoose.Schema.ObjectId, ref: 'Producto', required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precioAlComprar: { type: Number, required: true },
    nombreProducto: { type: String, required: true }
});

/* --- Modelo Pedido --- */
const pedidoSchema = new mongoose.Schema({
    cliente: { type: mongoose.Schema.ObjectId, ref: 'Cliente', required: true },
    items: [itemPedidoSchema],
    total: { type: Number, required: true, min: 0 },
    estado: {
        type: String,
        required: true,
        enum: ['Nuevo', 'En preparación', 'Listo para retiro', 'En camino', 'Entregado', 'Cancelado'],
        default: 'Nuevo'
    },
    metodoEntrega: {
        type: String,
        required: true,
        enum: ['Despacho', 'Retiro']
    },
    direccionDespacho: direccionPedidoSchema,
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pedido', pedidoSchema);