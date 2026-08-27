const express = require("express");

const autenticarToken = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const { uploadImagem } = require("../controllers/uploadController");

const router = express.Router();

router.post("/imagem", autenticarToken, upload.single("imagem"), uploadImagem);

module.exports = router;
