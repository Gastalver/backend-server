var jwt = require('jsonwebtoken');
const SEED = process.env.JWTSEED;

function verificaToken(req,res,next) {

    // El token debe ser enviado como un header de tipo authorization
    if(!req.headers.authorization){
        return res.status(401).json(
            {
                mensaje: 'La petición no tiene la cabecera de autenticación'}
            );
    }

    // Quitamos las comillas del token, por si las hubiera, ya que no forman parte de él.
    var token = req.headers.authorization.replace(/['"]+/g,''); // Esto es para quitar las comillas del token antes de evaluarlo.

    // Verificamos que es un token válido y con la firma correcta.
    jwt.verify(
        // Token enviado por el usuario
        token,
        // SEED
        SEED,
        // Opciones. De momento ninguna.
        {},
        // CallBack
        (error, decodificado) => {
            // Si no se decodifica bien, error 401: Error de autenticación.
            if (error){
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Token incorrecto',
                    errors: error
                });
            }
            // Comprobamos si el token ha expirado o no.
            // TODO COmprobar expiración
            // OK. Token válido y no expirado:
            // Cargamos el payload del token, es decir, los datos
            // de usuario, en una propiedad llamada usuario del req,
            // para tenerla a mano en toda la aplicación. Y seguimos

            req.usuario = decodificado.usuario;

            //Culminado el middleware damos paso a lo siguiente, que es el middleware de
            // verificación del role
            next();
        }
    )
}

function vertificaRoleAdministrador(req,res, next) {
    var usuario = req.usuario;
    // En el archivo de rutas hay que indicar en cuáles se utiliza.

    if (req.usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: {
                message: 'No es administrador'
            }
        })
    }
}

/**
 * Autorización especial para que cada usuario pueda actualizarse a sí mismo,
 * aunque no tenga el role de administrador. Para ser usado únicamente en la
 * ruta put /usuario:id
 * @param req
 * @param res
 * @param next
 * @returns {*|void|Promise<any>}
 */
function vertificaRoleAdmin_o_MismoUsuario(req,res, next) {
    var usuario = req.usuario;
    var id = req.params.id;
    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No ES ADMIN ni el propio usuario',
            errors: {
                message: 'No es administrador'
            }
        })
    }
}


module.exports = {
    verificaToken,
    vertificaRoleAdministrador,
    vertificaRoleAdmin_o_MismoUsuario
};
