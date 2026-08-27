const bcrypt = require("bcryptjs");
const pool = require("./config/database");

async function criarAdmin() {
  try {
    const nome = "Jeovane ";
    const email = "jeovanewellingtoncorreia@gmail.com";
    const senha = "120802008";

    const senhaHash = await bcrypt.hash(senha, 12);

    const resultado = await pool.query(
      `INSERT INTO administradores (nome, email, senha_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nome, email`,
      [nome, email, senhaHash]
    );

    console.log("Administrador criado com sucesso:");
    console.log(resultado.rows[0]);
  } catch (erro) {
    console.error("Erro ao criar administrador:", erro.message);
  } finally {
    await pool.end();
  }
}

criarAdmin();