var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

// TRUCO Objeto con valores admitidos en una propiedad (enum)
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un role permitido'
}
// TRUCO Validadores de mongoose con mensaje de error personalizado,
//  y plugin para que tb la validación de duplicados (unique) genere el mismo tipo de error que
//  mongoose en caso de no superar validación
var usuarioSchema = new Schema({
    nombre: { type: String, required: [true,'El nombre es necesario.'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario.']},
    password: { type: String, required: [true, 'La contraseña es necesaria']},
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE',enum: rolesValidos},
    google: { type: Boolean, default: false}
})

usuarioSchema.plugin(uniqueValidator, {message: '{PATH} ya existe y debe ser único.'});

module.exports = mongoose.model('Usuario', usuarioSchema);
