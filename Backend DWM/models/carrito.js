const mongoose = require('mongoose');

/* --- Sub-documento ItemCarrito --- */
const itemCarritoSchema = new mongoose.Schema({
    producto: { type: mongoose.Schema.ObjectId, ref: 'Producto', required: true },
    cantidad: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser al menos 1'],
        default: 1
    }
});

/* --- Modelo Carrito --- */
const carritoSchema = new mongoose.Schema({
    cliente: { type: mongoose.Schema.ObjectId, ref: 'Cliente', required: true, unique: true },
    items: [itemCarritoSchema],
    ultimoAcceso: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Carrito', carritoSchema);