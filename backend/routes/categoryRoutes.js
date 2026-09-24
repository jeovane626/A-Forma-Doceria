const express = require("express");

const {
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria,
} = require("../controllers/categoryController");

const autenticarToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Rota pública
router.get("/", listarCategorias);

// Rotas administrativas
router.post("/", autenticarToken, criarCategoria);

router.put("/:id", autenticarToken, atualizarCategoria);

router.delete("/:id", autenticarToken, excluirCategoria);

module.exports = router;