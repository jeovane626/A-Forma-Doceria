const pool = require("../config/database");

async function listarCategorias(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        id,
        nome,
        criado_em
      FROM categorias
      ORDER BY nome ASC
    `);

    return res.status(200).json(resultado.rows);
  } catch (erro) {
    console.error("Erro ao listar categorias:", erro);

    return res.status(500).json({
      erro: "Erro ao buscar as categorias.",
    });
  }
}

async function criarCategoria(req, res) {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "O nome da categoria é obrigatório.",
      });
    }

    const nomeCategoria = nome.trim();

    if (nomeCategoria.length > 50) {
      return res.status(400).json({
        erro: "O nome da categoria deve ter no máximo 50 caracteres.",
      });
    }

    const categoriaExistente = await pool.query(
      `
        SELECT id
        FROM categorias
        WHERE LOWER(nome) = LOWER($1)
      `,
      [nomeCategoria],
    );

    if (categoriaExistente.rows.length > 0) {
      return res.status(409).json({
        erro: "Essa categoria já existe.",
      });
    }

    const resultado = await pool.query(
      `
        INSERT INTO categorias (nome)
        VALUES ($1)
        RETURNING
          id,
          nome,
          criado_em
      `,
      [nomeCategoria],
    );

    return res.status(201).json({
      mensagem: "Categoria criada com sucesso!",
      categoria: resultado.rows[0],
    });
  } catch (erro) {
    console.error("Erro ao criar categoria:", erro);

    return res.status(500).json({
      erro: "Erro ao criar a categoria.",
    });
  }
}

async function atualizarCategoria(req, res) {
  const client = await pool.connect();

  try {
    const id = Number(req.params.id);
    const { nome } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID da categoria inválido.",
      });
    }

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "O nome da categoria é obrigatório.",
      });
    }

    const novoNome = nome.trim();

    if (novoNome.length > 50) {
      return res.status(400).json({
        erro: "O nome da categoria deve ter no máximo 50 caracteres.",
      });
    }

    await client.query("BEGIN");

    const categoriaAtual = await client.query(
      `
        SELECT id, nome
        FROM categorias
        WHERE id = $1
        FOR UPDATE
      `,
      [id],
    );

    if (categoriaAtual.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        erro: "Categoria não encontrada.",
      });
    }

    const categoriaDuplicada = await client.query(
      `
        SELECT id
        FROM categorias
        WHERE LOWER(nome) = LOWER($1)
          AND id <> $2
      `,
      [novoNome, id],
    );

    if (categoriaDuplicada.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        erro: "Já existe uma categoria com esse nome.",
      });
    }

    const nomeAntigo = categoriaAtual.rows[0].nome;

    const resultado = await client.query(
      `
        UPDATE categorias
        SET nome = $1
        WHERE id = $2
        RETURNING
          id,
          nome,
          criado_em
      `,
      [novoNome, id],
    );

    await client.query(
      `
        UPDATE produtos
        SET
          categoria = $1,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE categoria = $2
      `,
      [novoNome, nomeAntigo],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      mensagem: "Categoria atualizada com sucesso!",
      categoria: resultado.rows[0],
    });
  } catch (erro) {
    await client.query("ROLLBACK");

    console.error("Erro ao atualizar categoria:", erro);

    return res.status(500).json({
      erro: "Erro ao atualizar a categoria.",
    });
  } finally {
    client.release();
  }
}

async function excluirCategoria(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID da categoria inválido.",
      });
    }

    const categoria = await pool.query(
      `
        SELECT id, nome
        FROM categorias
        WHERE id = $1
      `,
      [id],
    );

    if (categoria.rows.length === 0) {
      return res.status(404).json({
        erro: "Categoria não encontrada.",
      });
    }

    const nomeCategoria = categoria.rows[0].nome;

    const produtosRelacionados = await pool.query(
      `
        SELECT COUNT(*) AS quantidade
        FROM produtos
        WHERE categoria = $1
      `,
      [nomeCategoria],
    );

    const quantidadeProdutos = Number(
      produtosRelacionados.rows[0].quantidade,
    );

    if (quantidadeProdutos > 0) {
      return res.status(409).json({
        erro:
          "Esta categoria possui produtos. Mova os produtos para outra categoria antes de excluí-la.",
      });
    }

    await pool.query(
      `
        DELETE FROM categorias
        WHERE id = $1
      `,
      [id],
    );

    return res.status(200).json({
      mensagem: "Categoria excluída com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao excluir categoria:", erro);

    return res.status(500).json({
      erro: "Erro ao excluir a categoria.",
    });
  }
}

module.exports = {
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria,
};