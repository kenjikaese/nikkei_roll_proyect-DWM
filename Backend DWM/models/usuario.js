const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Formato de email inválido']
    },
    password: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        required: true,
        enum: ['Activo', 'Inactivo', 'Pendiente de Validación'],
        default: 'Pendiente de Validación'
    },
    
    /* --- Relaciones --- */
    cliente: { type: mongoose.Schema.ObjectId, ref: 'Cliente', required: true },
    perfil: { type: mongoose.Schema.ObjectId, ref: 'Perfil', required: true }
});

module.exports = mongoose.model('Usuario', usuarioSchema);