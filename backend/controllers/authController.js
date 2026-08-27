const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const crypto = require("crypto");

const { enviarEmailRecuperacao } = require("../services/emailService");

async function login(req, res) {
  try {
    const { email, senha } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !email.trim() ||
      !senha
    ) {
      return res.status(400).json({
        erro: "E-mail e senha são obrigatórios.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não configurado.");

      return res.status(500).json({
        erro: "Erro interno do servidor.",
      });
    }

    const resultado = await pool.query(
      `
        SELECT id, email, senha_hash
        FROM administradores
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [email.trim()],
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos.",
      });
    }

    const administrador = resultado.rows[0];

    const senhaCorreta = await bcrypt.compare(
      senha,
      administrador.senha_hash,
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos.",
      });
    }

    const token = jwt.sign(
      {
        id: administrador.id,
        email: administrador.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      },
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
    });
  } catch (erro) {
    console.error("Erro no login:", erro);

    return res.status(500).json({
      erro: "Erro interno do servidor.",
    });
  }
}

async function esqueciSenha(req, res) {
  try {
    const { email } = req.body || {};

    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        erro: "O e-mail é obrigatório.",
      });
    }

    const emailNormalizado = email.trim();

    const mensagemPadrao = {
      mensagem:
        "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.",
    };

    const resultado = await pool.query(
      `
        SELECT id
        FROM administradores
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [emailNormalizado],
    );

    if (resultado.rows.length === 0) {
      return res.status(200).json(mensagemPadrao);
    }

    const administradorId = resultado.rows[0].id;

    await pool.query(
      `
        DELETE FROM tokens_recuperacao_senha
        WHERE administrador_id = $1
           OR expira_em < CURRENT_TIMESTAMP
      `,
      [administradorId],
    );

    const token = crypto
      .randomBytes(32)
      .toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await pool.query(
      `
        INSERT INTO tokens_recuperacao_senha (
          administrador_id,
          token_hash,
          expira_em
        )
        VALUES (
          $1,
          $2,
          CURRENT_TIMESTAMP + INTERVAL '30 minutes'
        )
      `,
      [administradorId, tokenHash],
    );

    await enviarEmailRecuperacao(
      emailNormalizado,
      token,
    );

    if (process.env.NODE_ENV !== "production") {
      console.log(
        "Token de recuperação gerado em ambiente de desenvolvimento.",
      );
    }

    return res.status(200).json(mensagemPadrao);
  } catch (erro) {
    console.error(
      "Erro na recuperação de senha:",
      erro,
    );

    return res.status(500).json({
      erro: "Erro interno do servidor.",
    });
  }
}

async function redefinirSenha(req, res) {
  let client;

  try {
    const { token, novaSenha } = req.body || {};

    if (
      typeof token !== "string" ||
      typeof novaSenha !== "string" ||
      !token.trim() ||
      !novaSenha
    ) {
      return res.status(400).json({
        erro: "Token e nova senha são obrigatórios.",
      });
    }

    if (novaSenha.length < 8) {
      return res.status(400).json({
        erro: "A nova senha deve possuir pelo menos 8 caracteres.",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resultadoToken = await pool.query(
      `
        SELECT
          id,
          administrador_id
        FROM tokens_recuperacao_senha
        WHERE token_hash = $1
          AND usado_em IS NULL
          AND expira_em > CURRENT_TIMESTAMP
        LIMIT 1
      `,
      [tokenHash],
    );

    if (resultadoToken.rows.length === 0) {
      return res.status(400).json({
        erro: "Token inválido ou expirado.",
      });
    }

    const tokenRecuperacao =
      resultadoToken.rows[0];

    const senhaHash = await bcrypt.hash(
      novaSenha,
      12,
    );

    client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
          UPDATE administradores
          SET senha_hash = $1
          WHERE id = $2
        `,
        [
          senhaHash,
          tokenRecuperacao.administrador_id,
        ],
      );

      await client.query(
        `
          UPDATE tokens_recuperacao_senha
          SET usado_em = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [tokenRecuperacao.id],
      );

      await client.query(
        `
          DELETE FROM tokens_recuperacao_senha
          WHERE administrador_id = $1
            AND id <> $2
        `,
        [
          tokenRecuperacao.administrador_id,
          tokenRecuperacao.id,
        ],
      );

      await client.query("COMMIT");
    } catch (erro) {
      await client.query("ROLLBACK");
      throw erro;
    }

    return res.status(200).json({
      mensagem: "Senha redefinida com sucesso!",
    });
  } catch (erro) {
    console.error(
      "Erro ao redefinir senha:",
      erro,
    );

    return res.status(500).json({
      erro: "Erro interno do servidor.",
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = {
  login,
  esqueciSenha,
  redefinirSenha,
};