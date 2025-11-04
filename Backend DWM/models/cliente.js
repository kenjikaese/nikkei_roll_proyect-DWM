const mongoose = require('mongoose');

/* --- Sub-documento Direccion --- */
const direccionSchema = new mongoose.Schema({
    calle: { type: String, required: true },
    comuna: { type: String, required: true },
    region: { type: String, required: true },
    instrucciones: String
});

/* --- Modelo Cliente --- */
const clienteSchema = new mongoose.Schema({
    nombreCompleto: { type: String, required: true },
    run: { type: String, required: true, unique: true },
    fechaNacimiento: Date,
    sexo: String,
    telefono: { type: String, required: true },
    direcciones: [direccionSchema]
});

module.exports = mongoose.model('Cliente', clienteSchema);