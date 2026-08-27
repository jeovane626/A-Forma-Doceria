document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("formRecuperacao");

  const mensagem = document.getElementById("mensagem");

  formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    mensagem.textContent = "Enviando...";

    try {
      const resposta = await fetch(
        `${API_URL}/api/auth/esqueci-senha`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        mensagem.textContent =
          dados.erro || "Não foi possível enviar o e-mail.";

        return;
      }

      mensagem.textContent = dados.mensagem;

      formulario.reset();
    } catch (erro) {
      console.error(erro);

      mensagem.textContent = "Não foi possível conectar ao servidor.";
    }
  });
});
