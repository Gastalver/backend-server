// Dependencias, de node, para gestionar path y sistema de archivos.
const path = require('path');
const fs = require('fs');

function getImagen(req,res) {
    // Recuperamos los parametros de la url
    var coleccion = req.params.coleccion;
    var img = req.params.img;
    // Generamos la dirección completa de la imagen solicitada en el sistema de archivos
    var pathImagen = path.resolve(__dirname, `../uploads/${coleccion}/${img}`)
    // Si existe, enviamos la imagen, sino, una imagen por defecto.
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen, (err)=> {
            if(err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar imagen',
                    errors: err
                })
            }
        })
    } else {
        var pathImagenPorDefecto = path.resolve(__dirname, `../assets/img/no-img.jpg`);
        res.sendFile(pathImagenPorDefecto, (err)=> {
            if(err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar imagen por defecto',
                    errors: err
                })
            }
        });
    }
}

module.exports = {
    getImagen
};
