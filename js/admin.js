document.addEventListener("DOMContentLoaded", async function () {
  const token =
    localStorage.getItem("adminToken");

  const listaProdutos =
    document.getElementById("listaProdutosAdmin");

  const mensagem =
    document.getElementById("mensagem");

  const botaoSair =
    document.getElementById("botaoSair");

  const botaoNovoProduto =
    document.getElementById("botaoNovoProduto");

  const formContainer =
    document.getElementById("formProdutoContainer");

  const formularioProduto =
    document.getElementById("formProduto");

  const botaoCancelar =
    document.getElementById("cancelarProduto");

  const produtoId =
    document.getElementById("produtoId");

  const nomeProduto =
    document.getElementById("nomeProduto");

  const descricaoProduto =
    document.getElementById("descricaoProduto");

  const precoProduto =
    document.getElementById("precoProduto");

  const imagemProduto =
    document.getElementById("imagemProduto");

  const imagemAtual =
    document.getElementById("imagemAtual");

  const previewImagemAtual =
    document.getElementById("previewImagemAtual");

  const tituloFormulario =
    document.getElementById("tituloFormulario");

  let urlImagemAtual = "";

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  async function verificarLogin() {
    try {
      const resposta = await fetch(
        `${API_URL}/api/admin/perfil`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!resposta.ok) {
        localStorage.removeItem("adminToken");

        window.location.href =
          "login.html";

        return false;
      }

      return true;

    } catch (erro) {
      console.error(
        "Erro ao verificar login:",
        erro
      );

      mensagem.textContent =
        "Não foi possível conectar ao servidor.";

      return false;
    }
  }

  function formatarPreco(valor) {
    return Number(valor).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );
  }

  function limparFormulario() {
    formularioProduto.reset();

    produtoId.value = "";

    urlImagemAtual = "";

    imagemAtual.textContent = "";

    previewImagemAtual.src = "";

    previewImagemAtual.style.display =
      "none";

    tituloFormulario.textContent =
      "Cadastrar Produto";
  }

  async function carregarProdutos() {
    try {
      const resposta = await fetch(
        `${API_URL}/api/produtos`
      );

      if (!resposta.ok) {
        throw new Error(
          "Erro ao carregar produtos."
        );
      }

      const produtos =
        await resposta.json();

      listaProdutos.innerHTML = "";

      if (produtos.length === 0) {
        listaProdutos.innerHTML =
          "<p>Nenhum produto cadastrado.</p>";

        return;
      }

      produtos.forEach(function (produto) {
        const article =
          document.createElement("article");

        article.classList.add(
          "produto-admin"
        );

        article.innerHTML = `
          ${
            produto.imagem
              ? `
                <img
                  src="${produto.imagem}"
                  alt="${produto.nome}"
                >
              `
              : ""
          }

          <h3>
            ${produto.nome}
          </h3>

          <p>
            ${produto.descricao || ""}
          </p>

          <p class="preco">
            ${formatarPreco(produto.preco)}
          </p>

          <div class="acoes-produto">

            <button
              type="button"
              class="editar"
              data-id="${produto.id}"
            >
              Editar
            </button>

            <button
              type="button"
              class="desativar"
              data-id="${produto.id}"
            >
              Desativar
            </button>

          </div>
        `;

        listaProdutos.appendChild(
          article
        );
      });

      document
        .querySelectorAll(".editar")
        .forEach(function (botao) {
          botao.addEventListener(
            "click",
            function () {
              const id =
                Number(botao.dataset.id);

              const produto =
                produtos.find(function (item) {
                  return Number(item.id) === id;
                });

              if (!produto) {
                return;
              }

              produtoId.value =
                produto.id;

              nomeProduto.value =
                produto.nome;

              descricaoProduto.value =
                produto.descricao || "";

              precoProduto.value =
                Number(produto.preco);

              imagemProduto.value = "";

              urlImagemAtual =
                produto.imagem || "";

              if (urlImagemAtual) {
                imagemAtual.textContent =
                  "Imagem atual:";

                previewImagemAtual.src =
                  urlImagemAtual;

                previewImagemAtual.style.display =
                  "block";
              } else {
                imagemAtual.textContent =
                  "Este produto ainda não possui imagem.";

                previewImagemAtual.src =
                  "";

                previewImagemAtual.style.display =
                  "none";
              }

              tituloFormulario.textContent =
                "Editar Produto";

              formContainer.classList.remove(
                "oculto"
              );

              nomeProduto.focus();

              window.scrollTo({
                top:
                  formContainer.offsetTop - 20,

                behavior: "smooth"
              });
            }
          );
        });

      document
        .querySelectorAll(".desativar")
        .forEach(function (botao) {
          botao.addEventListener(
            "click",
            async function () {
              const id =
                Number(botao.dataset.id);

              const confirmar =
                window.confirm(
                  "Deseja realmente desativar este produto?"
                );

              if (!confirmar) {
                return;
              }

              try {
                const resposta =
                  await fetch(
                    `${API_URL}/api/produtos/${id}`,
                    {
                      method: "DELETE",

                      headers: {
                        Authorization:
                          `Bearer ${token}`
                      }
                    }
                  );

                const dados =
                  await resposta.json();

                if (!resposta.ok) {
                  mensagem.textContent =
                    dados.erro ||
                    "Não foi possível desativar o produto.";

                  return;
                }

                mensagem.textContent =
                  "Produto desativado com sucesso!";

                await carregarProdutos();

              } catch (erro) {
                console.error(erro);

                mensagem.textContent =
                  "Erro ao conectar com o servidor.";
              }
            }
          );
        });

    } catch (erro) {
      console.error(erro);

      mensagem.textContent =
        "Não foi possível carregar os produtos.";
    }
  }

  botaoSair.addEventListener(
    "click",
    function () {
      localStorage.removeItem(
        "adminToken"
      );

      window.location.href =
        "login.html";
    }
  );

  botaoNovoProduto.addEventListener(
    "click",
    function () {
      limparFormulario();

      formContainer.classList.remove(
        "oculto"
      );

      nomeProduto.focus();
    }
  );

  botaoCancelar.addEventListener(
    "click",
    function () {
      limparFormulario();

      formContainer.classList.add(
        "oculto"
      );
    }
  );

  imagemProduto.addEventListener(
    "change",
    function () {
      const arquivo =
        imagemProduto.files[0];

      if (!arquivo) {
        return;
      }

      const urlTemporaria =
        URL.createObjectURL(arquivo);

      imagemAtual.textContent =
        "Nova imagem selecionada:";

      previewImagemAtual.src =
        urlTemporaria;

      previewImagemAtual.style.display =
        "block";
    }
  );

  formularioProduto.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      const id =
        produtoId.value;

      let urlImagem =
        urlImagemAtual;

      const arquivoImagem =
        imagemProduto.files[0];

      if (arquivoImagem) {
        const formData =
          new FormData();

        formData.append(
          "imagem",
          arquivoImagem
        );

        try {
          mensagem.textContent =
            "Enviando imagem...";

          const respostaUpload =
            await fetch(
              `${API_URL}/api/upload/imagem`,
              {
                method: "POST",

                headers: {
                  Authorization:
                    `Bearer ${token}`
                },

                body: formData
              }
            );

          const dadosUpload =
            await respostaUpload.json();

          if (!respostaUpload.ok) {
            mensagem.textContent =
              dadosUpload.erro ||
              "Não foi possível enviar a imagem.";

            return;
          }

          urlImagem =
            dadosUpload.url;

        } catch (erro) {
          console.error(
            "Erro ao enviar imagem:",
            erro
          );

          mensagem.textContent =
            "Erro ao enviar a imagem.";

          return;
        }
      }

      const produto = {
        nome:
          nomeProduto.value.trim(),

        descricao:
          descricaoProduto.value.trim(),

        preco:
          Number(precoProduto.value),

        imagem:
          urlImagem,

        ativo:
          true
      };

      let url =
        `${API_URL}/api/produtos`;

      let metodo =
        "POST";

      if (id) {
        url += "/" + id;

        metodo = "PUT";
      }

      try {
        mensagem.textContent =
          id
            ? "Atualizando produto..."
            : "Cadastrando produto...";

        const resposta =
          await fetch(
            url,
            {
              method: metodo,

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`
              },

              body:
                JSON.stringify(produto)
            }
          );

        const dados =
          await resposta.json();

        if (!resposta.ok) {
          mensagem.textContent =
            dados.erro ||
            "Não foi possível salvar o produto.";

          return;
        }

        if (id) {
          mensagem.textContent =
            "Produto atualizado com sucesso!";
        } else {
          mensagem.textContent =
            "Produto cadastrado com sucesso!";
        }

        limparFormulario();

        formContainer.classList.add(
          "oculto"
        );

        await carregarProdutos();

      } catch (erro) {
        console.error(erro);

        mensagem.textContent =
          "Erro ao conectar com o servidor.";
      }
    }
  );

  const autenticado =
    await verificarLogin();

  if (autenticado) {
    await carregarProdutos();
  }
});