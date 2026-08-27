const express = require("express");

const {
  login,
  esqueciSenha,
  redefinirSenha,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);

router.post("/esqueci-senha", esqueciSenha);

router.post("/redefinir-senha", redefinirSenha);

module.exports = router;
