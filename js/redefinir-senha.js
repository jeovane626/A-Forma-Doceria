document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("formRedefinir");

  const mensagem = document.getElementById("mensagem");

  const parametros = new URLSearchParams(window.location.search);

  const token = parametros.get("token");

  if (!token) {
    mensagem.textContent = "Link de recuperação inválido.";

    formulario.style.display = "none";

    return;
  }

  formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const novaSenha = document.getElementById("novaSenha").value;

    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (novaSenha !== confirmarSenha) {
      mensagem.textContent = "As senhas não são iguais.";

      return;
    }

    if (novaSenha.length < 8) {
      mensagem.textContent = "A senha deve possuir pelo menos 8 caracteres.";

      return;
    }

    mensagem.textContent = "Redefinindo senha...";

    try {
      const resposta = await fetch(
        "`${API_URL}/api/auth/redefinir-senha`",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            token,
            novaSenha,
          }),
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        mensagem.textContent =
          dados.erro || "Não foi possível redefinir a senha.";

        return;
      }

      mensagem.textContent =
        "Senha redefinida com sucesso! Redirecionando para o login...";

      formulario.reset();

      setTimeout(function () {
        window.location.href = "login.html";
      }, 2000);
    } catch (erro) {
      console.error(erro);

      mensagem.textContent = "Não foi possível conectar ao servidor.";
    }
  });
});
