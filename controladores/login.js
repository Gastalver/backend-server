// Dependencias
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_WEBCLIENT_ID);

// Configuración general privada obtenida de .env
const SEED = process.env.JWTSEED;

// Modelos
const Usuario = require('../modelos/usuario');

/**
 * Autenticación normal.
 * @param req
 * @param res
 */
function logIn (req,res) {

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
            // Devolvemos el usuario, el id, y el token, que deberá añadir el cliente en el body
            // de cada request que requiera autenticación y que controladará el middleware.
            return res.status(200).json(
                {
                    ok: true,
                    usuario: usuarioBD,
                    id: usuarioBD._id,
                    token: token,
                    menu: obtenerMenu(usuarioBD.role)
                }
            );
    }
    )
}

/**
 * Autenticación con Google
 * @param req
 * @param res
 */
async function logInGoogle (req,res) {
    // Previamente la app cliente debe haber obtenido un token de Google. (Cfr. adminpro login.component.ts)
    // Recibimos Token de Google., que el cliente  debe enviar en el body
    const token = req.body.token;
    const googleUser = await verify(token).catch((error) => {
        return res.status(500).json(
            {
                ok: false,
                mensaje: 'Error al verificar Token de Google. Token no válido.',
                errors: error
            }
        );
    });
    // Recuérdese que la función verify, devuelve el siguiente objeto:
    //  {
    //     nombre: payload.name,
    //     email: payload.email,
    //     img: payload.picture,
    //     google: true
    // }
    //
    // Siendo el valor de google true sólo si es un Google login qye se ha varificado correctamente.

    // Veruficado el usuario, tenemos los datos en googleUser. Lo buscamos en la base de datos por su email.
    Usuario.findOne(
        // Criterios
        {
            email: googleUser.email
        },
        // Callback
        ( err, usuarioBD ) => {
            if (err) {
                return res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al buscar usuario.',
                        errors: err
                    }
                );
            }
            // Si ya existe un usuario en la base de datos...
            if ( usuarioBD ) {
                // Y la propiedad google es false, es decir,
                // si no fue creado con Google...(lo veremos en registro)
                if (usuarioBD.google === false){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar su autenticación normal',
                        googleUser: googleUser
                    })
                } else {
                    // Si fue creado con Google
                    // Generamos token de acceso como en el login normal
                    let token = jwt.sign(
                        // PayLoad: Lo que contendrá el token
                        {usuario: usuarioBD},
                        // Seed. Palabreja para encriptar. La hemos importado de process.env.SEED más arriba.
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
                            token: token,
                            id: usuarioBD._id,
                            menu: obtenerMenu(usuarioBD.role)
                        }
                    );
                }
            } else {
                // Si no se ha encontrado usuario con el email indicado por googleUser, lo creamos.
                // En el futuro no necesitará indicar clave, pero deberá validarse por /loginGoogle
                // no por el login normal con usuario y clave.
                const usuario = new Usuario();
                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = true;
                usuario.password = ':)';
                usuario.save(
                    (error, usuarioBD) => {
                        if (error) {
                            return res.status(500).json(
                                {
                                    ok: false,
                                    mensaje: 'Error al crear usuario a partir de credenciales de Google.',
                                    errors: error
                                }
                            );
                        }
                        // Si se ha guardado correctamente
                        let token = jwt.sign(
                            // PayLoad: Lo que contendrá el token
                            {usuario: usuarioBD},
                            // Seed. Palabreja para encriptar. La hemos importado de process.env.SEED más arriba.
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
                                token: token,
                                id: usuarioBD._id,
                                menu: obtenerMenu(usuarioBD.role)
                            }
                        );
                    }
                )
            }
        }
    )

}

/**
 * Verifica token Google. Basado en documentación API Google.
 * @param token
 * @returns {Promise<{img: *, google: boolean, nombre: *, email: *}>}
 */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '1903587770-7qa1c89rbsv3b1f65a3hrs563d50ralq.apps.googleusercontent.com',  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

function obtenerMenu(ROLE) {
    const menu = [
        {
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard'},
                { titulo: 'ProgressBar', url: '/progress'},
                { titulo: 'Graficas', url: '/graficas1'},
                { titulo: 'Promesas', url: '/promesas'},
                { titulo: 'Rxjs', url: '/rxjs'},
            ]
        },
        {
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios'},
                { titulo: 'Médicos', url: '/medicos'},
                { titulo: 'Hospitales', url: '/hospitales'}
            ]
        }
    ];
    // La manera más fácil de distinguir un menú de usuario normal y otro de administrador.
    // Si es administrador se incluye un apartado en el array por medio del método unshift,
    // que lo coloca en primer lugar. (push lo coloca al final).
    if (ROLE == 'ADMIN_ROLE') {
        menu[1].submenu.unshift({titulo: 'Usuarios', url: '/usuarios' })
    }
    return menu;
}

    function renuevaToken(req, res) {
        // Como esta ruta exige estár autenticado, ya tenemos al usuario en req.usuario
        // lo unico que haremos será generar un nuevo token.
        let token = jwt.sign(
            // PayLoad: Lo que contendrá el token
            {usuario: req.usuario},
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
                token: token,
            }
        );
    }

module.exports = {
    logIn,
    logInGoogle,
    renuevaToken
};
