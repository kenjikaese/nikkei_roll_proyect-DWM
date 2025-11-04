const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    precio: {
        type: Number,
        required: true,
        min: [0, 'El precio no puede ser negativo']
    },
    imagenUrl: String,
    disponible: { type: Boolean, default: true },
    
    /* --- Relación --- */
    categoria: { type: mongoose.Schema.ObjectId, ref: 'Categoria', required: true }
});

module.exports = mongoose.model('Producto', productoSchema);