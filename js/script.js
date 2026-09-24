document.addEventListener("DOMContentLoaded", async function () {
  const listaProdutos = document.getElementById("listaProdutosLoja");
  const listaCategorias = document.getElementById("listaCategoriasLoja");

  let produtos = [];
  let carrinho = [];
  let categoriaSelecionada = "Todos";

  // =========================
  // CARRINHO
  // =========================

  try {
    const dadosCarrinho = localStorage.getItem("carrinho");

    if (dadosCarrinho) {
      carrinho = JSON.parse(dadosCarrinho);
    }

    if (!Array.isArray(carrinho)) {
      carrinho = [];
    }
  } catch (erro) {
    console.error("Erro ao carregar carrinho:", erro);
    carrinho = [];
  }

  function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  }

  function adicionarAoCarrinho(id) {
    const produto = produtos.find(function (item) {
      return Number(item.id) === Number(id);
    });

    if (!produto) {
      console.error("Produto não encontrado:", id);
      return;
    }

    const produtoExistente = carrinho.find(function (item) {
      return Number(item.id) === Number(produto.id);
    });

    if (produtoExistente) {
      produtoExistente.quantidade += 1;
      produtoExistente.nome = produto.nome;
      produtoExistente.preco = Number(produto.preco);
      produtoExistente.imagem = produto.imagem;
    } else {
      carrinho.push({
        id: Number(produto.id),
        nome: produto.nome,
        preco: Number(produto.preco),
        imagem: produto.imagem || "",
        quantidade: 1,
      });
    }

    salvarCarrinho();

    alert(produto.nome + " foi adicionado ao carrinho!");
  }

  // =========================
  // CATEGORIAS
  // =========================

  function selecionarCategoria(botao) {
    document.querySelectorAll(".categoria").forEach(function (item) {
      item.classList.remove("ativa");
    });

    botao.classList.add("ativa");

    categoriaSelecionada = botao.dataset.categoria;

    mostrarProdutos();
  }

  function criarBotaoCategoria(nome) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.classList.add("categoria");

    botao.dataset.categoria = nome;

    botao.textContent = nome;

    botao.addEventListener("click", function () {
      selecionarCategoria(botao);
    });

    return botao;
  }

  async function carregarCategorias() {
    try {
      const resposta = await fetch(`${API_URL}/api/categorias`);

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar as categorias.");
      }

      const categorias = await resposta.json();

      listaCategorias.innerHTML = "";

      // Botão Todos
      const botaoTodos = criarBotaoCategoria("Todos");

      botaoTodos.classList.add("ativa");

      listaCategorias.appendChild(botaoTodos);

      // Categorias cadastradas no banco
      categorias.forEach(function (categoria) {
        const botao = criarBotaoCategoria(categoria.nome);

        listaCategorias.appendChild(botao);
      });
    } catch (erro) {
      console.error("Erro ao carregar categorias:", erro);

      // Se houver algum problema na API,
      // mantém pelo menos a opção "Todos".
      listaCategorias.innerHTML = "";

      const botaoTodos = criarBotaoCategoria("Todos");

      botaoTodos.classList.add("ativa");

      listaCategorias.appendChild(botaoTodos);
    }
  }

  // =========================
  // PRODUTOS
  // =========================

  function mostrarProdutos() {
    listaProdutos.innerHTML = "";

    let produtosFiltrados = produtos;

    if (categoriaSelecionada !== "Todos") {
      produtosFiltrados = produtos.filter(function (produto) {
        return produto.categoria === categoriaSelecionada;
      });
    }

    if (produtosFiltrados.length === 0) {
      const mensagem = document.createElement("p");

      mensagem.classList.add("sem-produtos");

      mensagem.textContent =
        categoriaSelecionada === "Todos"
          ? "Nenhum produto disponível no momento."
          : "Nenhum produto disponível nesta categoria.";

      listaProdutos.appendChild(mensagem);

      return;
    }

    produtosFiltrados.forEach(function (produto) {
      const article = document.createElement("article");

      if (produto.imagem) {
        const imagem = document.createElement("img");

        imagem.src = produto.imagem;
        imagem.alt = produto.nome;

        article.appendChild(imagem);
      }

      const nome = document.createElement("h4");

      nome.textContent = produto.nome;

      article.appendChild(nome);

      const preco = document.createElement("p");

      preco.textContent = formatarPreco(produto.preco);

      article.appendChild(preco);

      const descricao = document.createElement("p");

      descricao.textContent = produto.descricao || "";

      article.appendChild(descricao);

      const botao = document.createElement("button");

      botao.type = "button";
      botao.classList.add("adicionar-carrinho");

      botao.dataset.id = produto.id;

      botao.textContent = "Adicionar ao Carrinho";

      botao.addEventListener("click", function () {
        adicionarAoCarrinho(Number(botao.dataset.id));
      });

      article.appendChild(botao);

      listaProdutos.appendChild(article);
    });
  }

  async function carregarProdutos() {
    try {
      const resposta = await fetch(`${API_URL}/api/produtos`);

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar os produtos.");
      }

      produtos = await resposta.json();

      produtos = produtos.map(function (produto) {
        return {
          ...produto,

          id: Number(produto.id),

          preco: Number(produto.preco),

          categoria: produto.categoria || "Outros",
        };
      });

      // Remove do carrinho produtos
      // que não estão mais disponíveis.
      carrinho = carrinho.filter(function (item) {
        return produtos.some(function (produto) {
          return Number(produto.id) === Number(item.id);
        });
      });

      // Atualiza dados dos produtos
      // que já estavam no carrinho.
      carrinho.forEach(function (item) {
        const produto = produtos.find(function (produto) {
          return Number(produto.id) === Number(item.id);
        });

        if (produto) {
          item.nome = produto.nome;

          item.preco = Number(produto.preco);

          item.imagem = produto.imagem || "";

          item.quantidade = Number(item.quantidade) || 1;
        }
      });

      salvarCarrinho();

      mostrarProdutos();
    } catch (erro) {
      console.error("Erro ao buscar produtos:", erro);

      listaProdutos.innerHTML = "";

      const mensagem = document.createElement("p");

      mensagem.classList.add("sem-produtos");

      mensagem.textContent = "Não foi possível carregar os produtos.";

      listaProdutos.appendChild(mensagem);
    }
  }

  // =========================
  // INICIALIZAÇÃO
  // =========================

  await carregarCategorias();

  await carregarProdutos();
});
