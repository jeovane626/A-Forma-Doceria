const express = require("express");
const autenticarToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/perfil", autenticarToken, (req, res) => {
  return res.status(200).json({
    mensagem: "Acesso autorizado ao painel administrativo!",
    administrador: req.administrador
  });
});

module.exports = router;