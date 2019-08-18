// Dependencias
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// Configuración general privada obtenida de .env
const SEED = process.env.JWTSEED;

// Modelos
var Usuario = require ('../modelos/usuario');

function postLogin (req,res) {

    let body = req.body;
    // Buscamos usuario con email suministrado
    Usuario.findOne(
        // Criterio
        {email: body.email},
        // CallBack
        (error, usuarioBD) => {
            // Si sucede error en el servidor, error 500
            if (error) {
                return res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al buscar usuario',
                        errors: error
                    }
                );
            }
            // Si no se encuentra usuario con email indicado, error 400: Email incorrecto
            if (!usuarioBD) {
                return res.status(400).json(
                    {
                        ok: false,
                        mensaje: 'Credenciales incorrectas - email',
                        errors: error
                    }
                );
            }
            // Desencriptamos y comparamos clave enviada y clave del usuario con email indicado
            // Si no coinciden, error 400: Password incorrecto.
            if (!bcrypt.compareSync( body.password, usuarioBD.password)){
                return res.status(400).json(
                    {
                        ok: false,
                        mensaje: 'Credenciales incorrectas - password',
                        errors: error
                    }
                );
            }
            // Email y Password son correctos. Iniciamos lógica de acceso:
            // Tuneamos contraseña del usuarioDB para no incluirla en el token
            usuarioBD.password = ':)';
            // Creamos token con jwt. Ver signature de sign
            let token = jwt.sign(
                // PayLoad: Lo que contendrá el token
                {usuario: usuarioBD},
                // Seed. Palabreja para encriptar. La hemos importado de configuracion.SEED más arriba.
                SEED,
                // Opciones del token. Esencial la fecha de expiración, para mayor seguridad.
                {
                    expiresIn: 14400
                }
                // Callback. De momento nada. Serviría para gestionar errores.
                );
            return res.status(200).json(
                {
                    ok: true,
                    usuario: usuarioBD,
                    id: usuarioBD._id,
                    token: token
                }
            );
    }
    )
}

module.exports = {
    postLogin
}
