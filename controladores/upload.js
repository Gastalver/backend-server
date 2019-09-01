// Dependencias
var fs = require('fs');

// Modelos
var Usuario = require('../modelos/usuario');
var Hospital = require('../modelos/hospital');
var Medico = require('../modelos/medico');

function putUpload (req, res) {

    // Establecemos olecciones permitidas.
    var coleccionesPermitidas = ['usuarios', 'medicos', 'hospitales'];

    // Establecemos extensiones de archivo permitidas. Tb se puede configurar en fileUpload (opciones Busboy)
    var extensionesPermitidas = ['jpg', 'jpeg', 'gif', 'png'];

    // Comprobamos si se ha enviado un archivo o no
    if (!req.files) {
        return res.status(400).json(
            {
                ok: false,
                mensaje: 'No se envió ningún archivo',
                errors: {message: 'No se envió ningún archivo al servidor.'}
            }
        )
    }

    // Recuperamos coleccion, Id y archivo
    var coleccion = req.params.coleccion;
    var id = req.params.id;
    var archivo = req.files.imagen;

    // Comprobamos si la colección está permitida.
    if (coleccionesPermitidas.lastIndexOf(coleccion) < 0) {
        return res.status(400).json(
            {
                ok: false,
                mensaje: 'Upload no permitido en la coleccion indicada.',
                errors: {message: 'Upload no permitido en la coleccion indicada'}
            }
        )
    }

    // Comprobamos si la extensión está permitida.
    // Primero extraemos la extensión del archivo
    var nombreArchivoDividido = archivo.name.split('.');
    var extension = nombreArchivoDividido[nombreArchivoDividido.length -1];
    if (extensionesPermitidas.lastIndexOf(extension) < 0) {
        return res.status(400).json(
            {
                ok: false,
                mensaje: 'Tipo de archivo no permitido.',
                errors: {message: 'Archivo no permitido. Sólo se permiten archivos con la extensión ' + extensionesPermitidas.concat(', ')}
            }
        )
    }

    // Asignamos nombre al archivo.
    // Usamos el id usuario más un número aleatorio, v.gr. milisegundos.
    // para asegurarnos que cada archivo tendrá un nombre único, que no
    // será cacheado por los navegadores..
    var nombreArchivo = `${id}-${new Date().getUTCMilliseconds()}.${extension}`;

    // Establecemos dónde ubicaremos los archivos, segun tipo.
    var path = `./uploads/${ coleccion }/${ nombreArchivo}`;

    // Movemos el archivo con su método mv() desde la memoria hasta su ubicación definitiva en el hd del servidor.
    archivo.mv(
        path,
        (err) => {
            if (err) {
                return res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al mover archivo',
                        errors: err
                    }
                )
            }
            // Validamos id, borramos eventual img anterior, y actualizamos registro
            validarYactualizar(coleccion, id, nombreArchivo, res);
        }
        );
}

function validarYactualizar(coleccion, id, nombreArchivo, res){
    if (coleccion == 'usuarios'){
        // Localizamos el registro del usuario
        Usuario.findById(id, (error,usuarioConId) => {
            if (error){
                return res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al buscar usuario con el Id indicado',
                        errors: error
                    }
                )
            }
            if (!usuarioConId){
                return res.status(401).json(
                    {
                        ok: false,
                        mensaje: 'No existe un usuario con el id indicado',
                        errors: {
                            message: 'No existe un usuario con el id indicado'
                        }
                    }
                )
            }
            // Comprobamos si ya tiene una imagen, para borrarla y no acumular imágenes.
            var pathViejo = './uploads/usuarios/' + usuarioConId.img;
            // Si existe, la borramos.
            if (fs.existsSync(pathViejo)){
                fs.unlink(pathViejo,(err)=>{
                    if (err) {
                        return res.status(500).json(
                            {
                                ok: false,
                                mensaje: 'Error al borrar imagen anterior.',
                                errors: err
                            }
                        )
                    }
                });
            }
            usuarioConId.img = nombreArchivo;
            usuarioConId.save((err,usuarioConIdActualizado)=> {
                if (error){
                    return res.status(500).json(
                        {
                            ok: false,
                            mensaje: 'Error al guardar imagen en usuario.',
                            errors: error
                        }
                    )
                } else {
                    usuarioConIdActualizado.password = ':)';
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada correctamente',
                        usuario: usuarioConIdActualizado
                    })
                }

            })
        })
            .exec()
    }
    if (coleccion == 'medicos'){
        // Localizamos el registro del médico
        Medico.findById(id, (error,medicoConId) => {
            if (error){
                return res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al buscar médico con el Id indicado',
                        errors: error
                    }
                )
            }
            if (!medicoConId){
                return res.status(401).json(
                    {
                        ok: false,
                        mensaje: 'No existe un médico con el id indicado',
                        errors: {
                            message: 'No existe un médico con el id indicado'
                        }
                    }
                )
            }
            // Comprobamos si ya tiene una imagen, para borrarla y no acumular imágenes.
            var pathViejo = './uploads/medicos/' + medicoConId.img;
            // Si existe, la borramos.
            if (fs.existsSync(pathViejo)){
                fs.unlink(pathViejo,(err)=>{
                    if (err) {
                        return res.status(500).json(
                            {
                                ok: false,
                                mensaje: 'Error al borrar imagen anterior.',
                                errors: err
                            }
                        )
                    }
                });
            }
            medicoConId.img = nombreArchivo;
            medicoConId.save((err,medicoConIdActualizado)=> {
                if (error){
                    return res.status(500).json(
                        {
                            ok: false,
                            mensaje: 'Error al guardar imagen en médico.',
                            errors: err
                        }
                    )
                } else {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de médico actualizada correctamente',
                        medico: medicoConIdActualizado
                    })
                }
            })
        })
            .exec()
    }
    if (coleccion == 'hospitales'){
        // Localizamos el registro del médico
        Hospital.findById(id, (error,hospitalConId) => {
            if (error){
                return res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al buscar hospital con el Id indicado',
                        errors: error
                    }
                )
            }
            if (!hospitalConId){
                return res.status(401).json(
                    {
                        ok: false,
                        mensaje: 'No existe un hospital con el id indicado',
                        errors: {
                            message: 'No existe un hospital con el id indicado'
                        }
                    }
                )
            }
            // Comprobamos si ya tiene una imagen, para borrarla y no acumular imágenes.
            var pathViejo = './uploads/hospitales/' + hospitalConId.img;
            // Si existe, la borramos.
            if (fs.existsSync(pathViejo)){
                fs.unlink(pathViejo,(err)=>{
                    if (err) {
                        return res.status(500).json(
                            {
                                ok: false,
                                mensaje: 'Error al borrar imagen anterior.',
                                errors: err
                            }
                        )
                    }
                });
            }
            hospitalConId.img = nombreArchivo;
            hospitalConId.save((err,hospitalConIdActualizado)=> {
                if (error){
                    return res.status(500).json(
                        {
                            ok: false,
                            mensaje: 'Error al guardar imagen en hospital.',
                            errors: err
                        }
                    )
                } else {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada correctamente',
                        hospital: hospitalConIdActualizado
                    })
                }
            })
        })
            .exec()
    }
}

module.exports = {
    putUpload
};
