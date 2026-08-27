document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("formLogin");
  const mensagem = document.getElementById("mensagem");

  formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    mensagem.textContent = "Entrando...";

    try {
      const resposta = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mensagem.textContent =
          dados.erro || "Não foi possível realizar o login.";

        return;
      }

      localStorage.setItem("adminToken", dados.token);

      window.location.href = "admin.html";
    } catch (erro) {
      console.error("Erro ao realizar login:", erro);

      mensagem.textContent = "Não foi possível conectar ao servidor.";
    }
  });
});
