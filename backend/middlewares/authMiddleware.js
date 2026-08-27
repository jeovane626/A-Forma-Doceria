const jwt = require("jsonwebtoken");

function autenticarToken(req, res, next) {
  try {
    const cabecalhoAutorizacao = req.headers.authorization;

    if (!cabecalhoAutorizacao) {
      return res.status(401).json({
        erro: "Token de autenticação não informado.",
      });
    }

    const partes = cabecalhoAutorizacao.trim().split(/\s+/);

    if (
      partes.length !== 2 ||
      partes[0].toLowerCase() !== "bearer" ||
      !partes[1]
    ) {
      return res.status(401).json({
        erro: "Formato de token inválido.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não está configurado.");

      return res.status(500).json({
        erro: "Erro interno do servidor.",
      });
    }

    const token = partes[1];

    const dadosToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!dadosToken.id) {
      return res.status(401).json({
        erro: "Token inválido ou expirado.",
      });
    }

    req.administrador = {
      id: dadosToken.id,
      email: dadosToken.email,
    };

    return next();
  } catch (erro) {
    if (
      erro.name === "JsonWebTokenError" ||
      erro.name === "TokenExpiredError" ||
      erro.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        erro: "Token inválido ou expirado.",
      });
    }

    console.error("Erro no middleware de autenticação:", erro);

    return res.status(500).json({
      erro: "Erro interno do servidor.",
    });
  }
}

module.exports = autenticarToken;
