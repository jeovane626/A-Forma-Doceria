document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("adminToken");

  // =========================
  // ELEMENTOS DOS PRODUTOS
  // =========================

  const listaProdutos = document.getElementById("listaProdutosAdmin");
  const mensagem = document.getElementById("mensagem");
  const botaoSair = document.getElementById("botaoSair");
  const botaoNovoProduto = document.getElementById("botaoNovoProduto");
  const formContainer = document.getElementById("formProdutoContainer");
  const formularioProduto = document.getElementById("formProduto");
  const botaoCancelar = document.getElementById("cancelarProduto");

  const produtoId = document.getElementById("produtoId");
  const nomeProduto = document.getElementById("nomeProduto");
  const descricaoProduto = document.getElementById("descricaoProduto");
  const categoriaProduto = document.getElementById("categoriaProduto");
  const precoProduto = document.getElementById("precoProduto");
  const imagemProduto = document.getElementById("imagemProduto");
  const imagemAtual = document.getElementById("imagemAtual");
  const previewImagemAtual = document.getElementById("previewImagemAtual");
  const tituloFormulario = document.getElementById("tituloFormulario");

  // =========================
  // ELEMENTOS DAS CATEGORIAS
  // =========================

  const listaCategorias = document.getElementById("listaCategoriasAdmin");
  const mensagemCategoria = document.getElementById("mensagemCategoria");

  const botaoNovaCategoria = document.getElementById("botaoNovaCategoria");

  const formCategoriaContainer = document.getElementById(
    "formCategoriaContainer",
  );

  const formularioCategoria = document.getElementById("formCategoria");

  const categoriaId = document.getElementById("categoriaId");

  const nomeCategoria = document.getElementById("nomeCategoria");

  const cancelarCategoria = document.getElementById("cancelarCategoria");

  const tituloFormularioCategoria = document.getElementById(
    "tituloFormularioCategoria",
  );

  let urlImagemAtual = "";
  let categorias = [];

  // =========================
  // AUTENTICAÇÃO
  // =========================

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  async function verificarLogin() {
    try {
      const resposta = await fetch(`${API_URL}/api/admin/perfil`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resposta.ok) {
        localStorage.removeItem("adminToken");
        window.location.href = "login.html";
        return false;
      }

      return true;
    } catch (erro) {
      console.error("Erro ao verificar login:", erro);

      mensagem.textContent = "Não foi possível conectar ao servidor.";

      return false;
    }
  }

  // =========================
  // FUNÇÕES GERAIS
  // =========================

  function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // =========================
  // CATEGORIAS
  // =========================

  function limparFormularioCategoria() {
    formularioCategoria.reset();

    categoriaId.value = "";

    tituloFormularioCategoria.textContent = "Cadastrar Categoria";
  }

  function preencherSelectCategorias() {
    const categoriaSelecionada = categoriaProduto.value;

    categoriaProduto.innerHTML = "";

    const opcaoInicial = document.createElement("option");

    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione uma categoria";

    categoriaProduto.appendChild(opcaoInicial);

    categorias.forEach(function (categoria) {
      const option = document.createElement("option");

      option.value = categoria.nome;
      option.textContent = categoria.nome;

      categoriaProduto.appendChild(option);
    });

    if (
      categorias.some(function (categoria) {
        return categoria.nome === categoriaSelecionada;
      })
    ) {
      categoriaProduto.value = categoriaSelecionada;
    }
  }

  async function carregarCategorias() {
    try {
      const resposta = await fetch(`${API_URL}/api/categorias`);

      if (!resposta.ok) {
        throw new Error("Erro ao carregar categorias.");
      }

      categorias = await resposta.json();

      listaCategorias.innerHTML = "";

      preencherSelectCategorias();

      if (categorias.length === 0) {
        listaCategorias.innerHTML = "<p>Nenhuma categoria cadastrada.</p>";

        return;
      }

      categorias.forEach(function (categoria) {
        const article = document.createElement("article");

        article.classList.add("categoria-admin");

        const nome = document.createElement("h3");
        nome.textContent = categoria.nome;

        const acoes = document.createElement("div");
        acoes.classList.add("acoes-categoria");

        const botaoEditar = document.createElement("button");

        botaoEditar.type = "button";
        botaoEditar.classList.add("editar-categoria");
        botaoEditar.dataset.id = categoria.id;
        botaoEditar.textContent = "Editar";

        const botaoExcluir = document.createElement("button");

        botaoExcluir.type = "button";
        botaoExcluir.classList.add("excluir-categoria");
        botaoExcluir.dataset.id = categoria.id;
        botaoExcluir.textContent = "Excluir";

        acoes.appendChild(botaoEditar);
        acoes.appendChild(botaoExcluir);

        article.appendChild(nome);
        article.appendChild(acoes);

        listaCategorias.appendChild(article);
      });

      document.querySelectorAll(".editar-categoria").forEach(function (botao) {
        botao.addEventListener("click", function () {
          const id = Number(botao.dataset.id);

          const categoria = categorias.find(function (item) {
            return Number(item.id) === id;
          });

          if (!categoria) {
            return;
          }

          categoriaId.value = categoria.id;
          nomeCategoria.value = categoria.nome;

          tituloFormularioCategoria.textContent = "Editar Categoria";

          formCategoriaContainer.classList.remove("oculto");

          nomeCategoria.focus();
        });
      });

      document.querySelectorAll(".excluir-categoria").forEach(function (botao) {
        botao.addEventListener("click", async function () {
          const id = Number(botao.dataset.id);

          const categoria = categorias.find(function (item) {
            return Number(item.id) === id;
          });

          if (!categoria) {
            return;
          }

          const confirmar = window.confirm(
            `Deseja realmente excluir a categoria "${categoria.nome}"?`,
          );

          if (!confirmar) {
            return;
          }

          try {
            mensagemCategoria.textContent = "Excluindo categoria...";

            const resposta = await fetch(`${API_URL}/api/categorias/${id}`, {
              method: "DELETE",

              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
              mensagemCategoria.textContent =
                dados.erro || "Não foi possível excluir a categoria.";

              return;
            }

            mensagemCategoria.textContent = "Categoria excluída com sucesso!";

            await carregarCategorias();
          } catch (erro) {
            console.error("Erro ao excluir categoria:", erro);

            mensagemCategoria.textContent = "Erro ao conectar com o servidor.";
          }
        });
      });
    } catch (erro) {
      console.error("Erro ao carregar categorias:", erro);

      mensagemCategoria.textContent =
        "Não foi possível carregar as categorias.";
    }
  }

  botaoNovaCategoria.addEventListener("click", function () {
    limparFormularioCategoria();

    mensagemCategoria.textContent = "";

    formCategoriaContainer.classList.remove("oculto");

    nomeCategoria.focus();
  });

  cancelarCategoria.addEventListener("click", function () {
    limparFormularioCategoria();

    formCategoriaContainer.classList.add("oculto");
  });

  formularioCategoria.addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = categoriaId.value;
    const nome = nomeCategoria.value.trim();

    if (!nome) {
      mensagemCategoria.textContent = "Digite o nome da categoria.";

      return;
    }

    let url = `${API_URL}/api/categorias`;
    let metodo = "POST";

    if (id) {
      url += "/" + id;
      metodo = "PUT";
    }

    try {
      mensagemCategoria.textContent = id
        ? "Atualizando categoria..."
        : "Cadastrando categoria...";

      const resposta = await fetch(url, {
        method: metodo,

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          nome: nome,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mensagemCategoria.textContent =
          dados.erro || "Não foi possível salvar a categoria.";

        return;
      }

      mensagemCategoria.textContent = id
        ? "Categoria atualizada com sucesso!"
        : "Categoria cadastrada com sucesso!";

      limparFormularioCategoria();

      formCategoriaContainer.classList.add("oculto");

      await carregarCategorias();

      await carregarProdutos();
    } catch (erro) {
      console.error("Erro ao salvar categoria:", erro);

      mensagemCategoria.textContent = "Erro ao conectar com o servidor.";
    }
  });

  // =========================
  // PRODUTOS
  // =========================

  function limparFormulario() {
    formularioProduto.reset();

    produtoId.value = "";

    categoriaProduto.value = "";

    urlImagemAtual = "";

    imagemAtual.textContent = "";

    previewImagemAtual.src = "";

    previewImagemAtual.style.display = "none";

    tituloFormulario.textContent = "Cadastrar Produto";
  }

  async function carregarProdutos() {
    try {
      const resposta = await fetch(`${API_URL}/api/produtos`);

      if (!resposta.ok) {
        throw new Error("Erro ao carregar produtos.");
      }

      const produtos = await resposta.json();

      listaProdutos.innerHTML = "";

      if (produtos.length === 0) {
        listaProdutos.innerHTML = "<p>Nenhum produto cadastrado.</p>";

        return;
      }

      produtos.forEach(function (produto) {
        const article = document.createElement("article");

        article.classList.add("produto-admin");

        if (produto.imagem) {
          const imagem = document.createElement("img");

          imagem.src = produto.imagem;
          imagem.alt = produto.nome;

          article.appendChild(imagem);
        }

        const nome = document.createElement("h3");

        nome.textContent = produto.nome;

        article.appendChild(nome);

        const descricao = document.createElement("p");

        descricao.textContent = produto.descricao || "";

        article.appendChild(descricao);

        const categoria = document.createElement("p");

        categoria.classList.add("categoria-produto");

        categoria.textContent = "Categoria: " + (produto.categoria || "Outros");

        article.appendChild(categoria);

        const preco = document.createElement("p");

        preco.classList.add("preco");

        preco.textContent = formatarPreco(produto.preco);

        article.appendChild(preco);

        const acoes = document.createElement("div");

        acoes.classList.add("acoes-produto");

        const botaoEditar = document.createElement("button");

        botaoEditar.type = "button";
        botaoEditar.classList.add("editar");
        botaoEditar.dataset.id = produto.id;
        botaoEditar.textContent = "Editar";

        const botaoDesativar = document.createElement("button");

        botaoDesativar.type = "button";
        botaoDesativar.classList.add("desativar");
        botaoDesativar.dataset.id = produto.id;
        botaoDesativar.textContent = "Desativar";

        acoes.appendChild(botaoEditar);
        acoes.appendChild(botaoDesativar);

        article.appendChild(acoes);

        listaProdutos.appendChild(article);
      });

      document.querySelectorAll(".editar").forEach(function (botao) {
        botao.addEventListener("click", function () {
          const id = Number(botao.dataset.id);

          const produto = produtos.find(function (item) {
            return Number(item.id) === id;
          });

          if (!produto) {
            return;
          }

          produtoId.value = produto.id;

          nomeProduto.value = produto.nome;

          descricaoProduto.value = produto.descricao || "";

          categoriaProduto.value = produto.categoria || "";

          precoProduto.value = Number(produto.preco);

          imagemProduto.value = "";

          urlImagemAtual = produto.imagem || "";

          if (urlImagemAtual) {
            imagemAtual.textContent = "Imagem atual:";

            previewImagemAtual.src = urlImagemAtual;

            previewImagemAtual.style.display = "block";
          } else {
            imagemAtual.textContent = "Este produto ainda não possui imagem.";

            previewImagemAtual.src = "";

            previewImagemAtual.style.display = "none";
          }

          tituloFormulario.textContent = "Editar Produto";

          formContainer.classList.remove("oculto");

          nomeProduto.focus();

          window.scrollTo({
            top: formContainer.offsetTop - 20,
            behavior: "smooth",
          });
        });
      });

      document.querySelectorAll(".desativar").forEach(function (botao) {
        botao.addEventListener("click", async function () {
          const id = Number(botao.dataset.id);

          const confirmar = window.confirm(
            "Deseja realmente desativar este produto?",
          );

          if (!confirmar) {
            return;
          }

          try {
            const resposta = await fetch(`${API_URL}/api/produtos/${id}`, {
              method: "DELETE",

              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
              mensagem.textContent =
                dados.erro || "Não foi possível desativar o produto.";

              return;
            }

            mensagem.textContent = "Produto desativado com sucesso!";

            await carregarProdutos();
          } catch (erro) {
            console.error(erro);

            mensagem.textContent = "Erro ao conectar com o servidor.";
          }
        });
      });
    } catch (erro) {
      console.error(erro);

      mensagem.textContent = "Não foi possível carregar os produtos.";
    }
  }

  // =========================
  // EVENTOS DOS PRODUTOS
  // =========================

  botaoSair.addEventListener("click", function () {
    localStorage.removeItem("adminToken");

    window.location.href = "login.html";
  });

  botaoNovoProduto.addEventListener("click", function () {
    limparFormulario();

    formContainer.classList.remove("oculto");

    nomeProduto.focus();
  });

  botaoCancelar.addEventListener("click", function () {
    limparFormulario();

    formContainer.classList.add("oculto");
  });

  imagemProduto.addEventListener("change", function () {
    const arquivo = imagemProduto.files[0];

    if (!arquivo) {
      return;
    }

    const urlTemporaria = URL.createObjectURL(arquivo);

    imagemAtual.textContent = "Nova imagem selecionada:";

    previewImagemAtual.src = urlTemporaria;

    previewImagemAtual.style.display = "block";
  });

  formularioProduto.addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = produtoId.value;

    let urlImagem = urlImagemAtual;

    const arquivoImagem = imagemProduto.files[0];

    if (arquivoImagem) {
      const formData = new FormData();

      formData.append("imagem", arquivoImagem);

      try {
        mensagem.textContent = "Enviando imagem...";

        const respostaUpload = await fetch(`${API_URL}/api/upload/imagem`, {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        });

        const dadosUpload = await respostaUpload.json();

        if (!respostaUpload.ok) {
          mensagem.textContent =
            dadosUpload.erro || "Não foi possível enviar a imagem.";

          return;
        }

        urlImagem = dadosUpload.url;
      } catch (erro) {
        console.error("Erro ao enviar imagem:", erro);

        mensagem.textContent = "Erro ao enviar a imagem.";

        return;
      }
    }

    const produto = {
      nome: nomeProduto.value.trim(),

      descricao: descricaoProduto.value.trim(),

      categoria: categoriaProduto.value,

      preco: Number(precoProduto.value),

      imagem: urlImagem,

      ativo: true,
    };

    let url = `${API_URL}/api/produtos`;

    let metodo = "POST";

    if (id) {
      url += "/" + id;

      metodo = "PUT";
    }

    try {
      mensagem.textContent = id
        ? "Atualizando produto..."
        : "Cadastrando produto...";

      const resposta = await fetch(url, {
        method: metodo,

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(produto),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mensagem.textContent =
          dados.erro || "Não foi possível salvar o produto.";

        return;
      }

      mensagem.textContent = id
        ? "Produto atualizado com sucesso!"
        : "Produto cadastrado com sucesso!";

      limparFormulario();

      formContainer.classList.add("oculto");

      await carregarProdutos();
    } catch (erro) {
      console.error(erro);

      mensagem.textContent = "Erro ao conectar com o servidor.";
    }
  });

  // =========================
  // INICIALIZAÇÃO
  // =========================

  const autenticado = await verificarLogin();

  if (autenticado) {
    await carregarCategorias();
    await carregarProdutos();
  }
});
