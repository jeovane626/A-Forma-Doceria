const cloudinary = require("../config/cloudinary");

async function uploadImagem(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        erro: "Nenhuma imagem foi enviada.",
      });
    }

    const base64 = req.file.buffer.toString("base64");

    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    const resultado = await cloudinary.uploader.upload(dataUri, {
      folder: "a-forma-doceria/produtos",
    });

    return res.status(201).json({
      mensagem: "Imagem enviada com sucesso!",
      url: resultado.secure_url,
      public_id: resultado.public_id,
    });
  } catch (erro) {
    console.error("Erro no upload:", erro);

    return res.status(500).json({
      erro: "Erro ao enviar a imagem.",
    });
  }
}

module.exports = {
  uploadImagem,
};
