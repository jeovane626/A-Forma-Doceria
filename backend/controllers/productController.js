const pool = require("../config/database");

// =========================
// FUNÇÃO AUXILIAR
// =========================

async function buscarCategoriaValida(categoria) {
  if (typeof categoria !== "string" || !categoria.trim()) {
    return null;
  }

  const nomeCategoria = categoria.trim();

  const resultado = await pool.query(
    `
      SELECT nome
      FROM categorias
      WHERE LOWER(nome) = LOWER($1)
      LIMIT 1
    `,
    [nomeCategoria],
  );

  if (resultado.rows.length === 0) {
    return null;
  }

  return resultado.rows[0].nome;
}

// =========================
// LISTAR PRODUTOS
// =========================

async function listarProdutos(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        id,
        nome,
        descricao,
        preco,
        imagem,
        categoria,
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
      erro: "Erro ao buscar os produtos.",
    });
  }
}

// =========================
// BUSCAR PRODUTO POR ID
// =========================

async function buscarProdutoPorId(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do produto inválido.",
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
          categoria,
          ativo,
          criado_em,
          atualizado_em
        FROM produtos
        WHERE id = $1
          AND ativo = TRUE
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Produto não encontrado.",
      });
    }

    return res.status(200).json(resultado.rows[0]);
  } catch (erro) {
    console.error("Erro ao buscar produto:", erro);

    return res.status(500).json({
      erro: "Erro ao buscar o produto.",
    });
  }
}

// =========================
// CRIAR PRODUTO
// =========================

async function criarProduto(req, res) {
  try {
    const { nome, descricao, preco, imagem, categoria } = req.body;

    if (typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({
        erro: "O nome do produto é obrigatório.",
      });
    }

    if (preco === undefined || preco === null || preco === "") {
      return res.status(400).json({
        erro: "O preço é obrigatório.",
      });
    }

    const precoNumero = Number(preco);

    if (!Number.isFinite(precoNumero) || precoNumero < 0) {
      return res.status(400).json({
        erro: "Preço inválido.",
      });
    }

    if (typeof categoria !== "string" || !categoria.trim()) {
      return res.status(400).json({
        erro: "Selecione uma categoria.",
      });
    }

    const categoriaProduto = await buscarCategoriaValida(categoria);

    if (!categoriaProduto) {
      return res.status(400).json({
        erro: "A categoria selecionada não existe.",
      });
    }

    const resultado = await pool.query(
      `
        INSERT INTO produtos (
          nome,
          descricao,
          preco,
          imagem,
          categoria,
          ativo
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          TRUE
        )
        RETURNING
          id,
          nome,
          descricao,
          preco,
          imagem,
          categoria,
          ativo,
          criado_em,
          atualizado_em
      `,
      [
        nome.trim(),

        typeof descricao === "string" && descricao.trim()
          ? descricao.trim()
          : null,

        precoNumero,

        typeof imagem === "string" && imagem.trim() ? imagem.trim() : null,

        categoriaProduto,
      ],
    );

    return res.status(201).json({
      mensagem: "Produto criado com sucesso!",

      produto: resultado.rows[0],
    });
  } catch (erro) {
    console.error("Erro ao criar produto:", erro);

    return res.status(500).json({
      erro: "Erro ao criar o produto.",
    });
  }
}

// =========================
// ATUALIZAR PRODUTO
// =========================

async function atualizarProduto(req, res) {
  try {
    const id = Number(req.params.id);

    const { nome, descricao, preco, imagem, categoria, ativo } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do produto inválido.",
      });
    }

    if (typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({
        erro: "O nome do produto é obrigatório.",
      });
    }

    if (preco === undefined || preco === null || preco === "") {
      return res.status(400).json({
        erro: "O preço é obrigatório.",
      });
    }

    const precoNumero = Number(preco);

    if (!Number.isFinite(precoNumero) || precoNumero < 0) {
      return res.status(400).json({
        erro: "Preço inválido.",
      });
    }

    if (typeof categoria !== "string" || !categoria.trim()) {
      return res.status(400).json({
        erro: "Selecione uma categoria.",
      });
    }

    const categoriaProduto = await buscarCategoriaValida(categoria);

    if (!categoriaProduto) {
      return res.status(400).json({
        erro: "A categoria selecionada não existe.",
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
          categoria = $5,
          ativo = $6,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING
          id,
          nome,
          descricao,
          preco,
          imagem,
          categoria,
          ativo,
          criado_em,
          atualizado_em
      `,
      [
        nome.trim(),

        typeof descricao === "string" && descricao.trim()
          ? descricao.trim()
          : null,

        precoNumero,

        typeof imagem === "string" && imagem.trim() ? imagem.trim() : null,

        categoriaProduto,

        typeof ativo === "boolean" ? ativo : true,

        id,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Produto não encontrado.",
      });
    }

    return res.status(200).json({
      mensagem: "Produto atualizado com sucesso!",

      produto: resultado.rows[0],
    });
  } catch (erro) {
    console.error("Erro ao atualizar produto:", erro);

    return res.status(500).json({
      erro: "Erro ao atualizar o produto.",
    });
  }
}

// =========================
// DESATIVAR PRODUTO
// =========================

async function desativarProduto(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do produto inválido.",
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
          categoria,
          ativo,
          atualizado_em
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Produto não encontrado ou já está desativado.",
      });
    }

    return res.status(200).json({
      mensagem: "Produto desativado com sucesso!",

      produto: resultado.rows[0],
    });
  } catch (erro) {
    console.error("Erro ao desativar produto:", erro);

    return res.status(500).json({
      erro: "Erro ao desativar o produto.",
    });
  }
}

// =========================
// EXPORTAÇÕES
// =========================

module.exports = {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  desativarProduto,
};
