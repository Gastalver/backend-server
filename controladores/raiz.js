function raiz(req,res) {
    res.status(200).json(
        {
            ok: true,
            mensaje: 'Petición realizada correctamente'
        }
    )
}

module.exports = {
    raiz
};
