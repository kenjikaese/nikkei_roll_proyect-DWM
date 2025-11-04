const mongoose = require('mongoose');

const perfilSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    descripcion: String
});

module.exports = mongoose.model('Perfil', perfilSchema);