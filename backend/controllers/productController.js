const pool = require("../config/database");

async function listarProdutos(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        id,
        nome,
        descricao,
        preco,
        imagem,
        ativo,
        criado_em,
        atualizado_em
      FROM produtos
      WHERE ativo = TRUE
      ORDER BY id ASC
    `);

    return res.status(200).json(resultado.rows);
  } catch (erro) {
    console.error("Erro ao listar produtos:", erro);

    return res.status(500).json({
      erro: "Erro ao buscar os produtos."
    });
  }
}

async function buscarProdutoPorId(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do produto inválido."
      });
    }

    const resultado = await pool.query(
      `
        SELECT
          id,
          nome,
          descricao,
          preco,
          imagem,
          ativo,
          criado_em,
          atualizado_em
        FROM produtos
        WHERE id = $1
          AND ativo = TRUE
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Produto não encontrado."
      });
    }

    return res.status(200).json(resultado.rows[0]);
  } catch (erro) {
    console.error("Erro ao buscar produto:", erro);

    return res.status(500).json({
      erro: "Erro ao buscar o produto."
    });
  }
}

async function criarProduto(req, res) {
  try {
    const {
      nome,
      descricao,
      preco,
      imagem
    } = req.body;

    if (!nome || !preco) {
      return res.status(400).json({
        erro: "Nome e preço são obrigatórios."
      });
    }

    const precoNumero = Number(preco);

    if (
      !Number.isFinite(precoNumero) ||
      precoNumero < 0
    ) {
      return res.status(400).json({
        erro: "Preço inválido."
      });
    }

    const resultado = await pool.query(
      `
        INSERT INTO produtos (
          nome,
          descricao,
          preco,
          imagem,
          ativo
        )
        VALUES ($1, $2, $3, $4, TRUE)
        RETURNING
          id,
          nome,
          descricao,
          preco,
          imagem,
          ativo,
          criado_em,
          atualizado_em
      `,
      [
        nome.trim(),
        descricao ? descricao.trim() : null,
        precoNumero,
        imagem ? imagem.trim() : null
      ]
    );

    return res.status(201).json({
      mensagem: "Produto criado com sucesso!",
      produto: resultado.rows[0]
    });
  } catch (erro) {
    console.error("Erro ao criar produto:", erro);

    return res.status(500).json({
      erro: "Erro ao criar o produto."
    });
  }
}

async function atualizarProduto(req, res) {
  try {
    const id = Number(req.params.id);

    const {
      nome,
      descricao,
      preco,
      imagem,
      ativo
    } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do produto inválido."
      });
    }

    if (!nome || !preco) {
      return res.status(400).json({
        erro: "Nome e preço são obrigatórios."
      });
    }

    const precoNumero = Number(preco);

    if (
      !Number.isFinite(precoNumero) ||
      precoNumero < 0
    ) {
      return res.status(400).json({
        erro: "Preço inválido."
      });
    }

    const resultado = await pool.query(
      `
        UPDATE produtos
        SET
          nome = $1,
          descricao = $2,
          preco = $3,
          imagem = $4,
          ativo = $5,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING
          id,
          nome,
          descricao,
          preco,
          imagem,
          ativo,
          criado_em,
          atualizado_em
      `,
      [
        nome.trim(),
        descricao ? descricao.trim() : null,
        precoNumero,
        imagem ? imagem.trim() : null,
        typeof ativo === "boolean" ? ativo : true,
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Produto não encontrado."
      });
    }

    return res.status(200).json({
      mensagem: "Produto atualizado com sucesso!",
      produto: resultado.rows[0]
    });
  } catch (erro) {
    console.error("Erro ao atualizar produto:", erro);

    return res.status(500).json({
      erro: "Erro ao atualizar o produto."
    });
  }
}

async function desativarProduto(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do produto inválido."
      });
    }

    const resultado = await pool.query(
      `
        UPDATE produtos
        SET
          ativo = FALSE,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $1
          AND ativo = TRUE
        RETURNING
          id,
          nome,
          ativo,
          atualizado_em
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Produto não encontrado ou já está desativado."
      });
    }

    return res.status(200).json({
      mensagem: "Produto desativado com sucesso!",
      produto: resultado.rows[0]
    });
  } catch (erro) {
    console.error("Erro ao desativar produto:", erro);

    return res.status(500).json({
      erro: "Erro ao desativar o produto."
    });
  }
}

module.exports = {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  desativarProduto
};