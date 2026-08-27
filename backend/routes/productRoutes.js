const express = require("express");

const {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  desativarProduto,
} = require("../controllers/productController");

const autenticarToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Rotas públicas
router.get("/", listarProdutos);
router.get("/:id", buscarProdutoPorId);

// Rotas administrativas
router.post("/", autenticarToken, criarProduto);

router.put("/:id", autenticarToken, atualizarProduto);

router.delete("/:id", autenticarToken, desativarProduto);

module.exports = router;
