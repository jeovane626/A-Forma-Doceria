document.addEventListener("DOMContentLoaded", async function () {
  const listaProdutos = document.getElementById("listaProdutosLoja");
  const botoesCategoria = document.querySelectorAll(".categoria");

  let produtos = [];
  let carrinho = [];
  let categoriaSelecionada = "Todos";

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

  function mostrarProdutos() {
    listaProdutos.innerHTML = "";

    let produtosFiltrados = produtos;

    if (categoriaSelecionada !== "Todos") {
      produtosFiltrados = produtos.filter(function (produto) {
        return produto.categoria === categoriaSelecionada;
      });
    }

    if (produtosFiltrados.length === 0) {
      listaProdutos.innerHTML = `
        <p class="sem-produtos">
          Nenhum produto disponível nesta categoria.
        </p>
      `;

      return;
    }

    produtosFiltrados.forEach(function (produto) {
      const article = document.createElement("article");

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

        <h4>
          ${produto.nome}
        </h4>

        <p>
          ${formatarPreco(produto.preco)}
        </p>

        <p>
          ${produto.descricao || ""}
        </p>

        <button
          type="button"
          class="adicionar-carrinho"
          data-id="${produto.id}"
        >
          Adicionar ao Carrinho
        </button>
      `;

      listaProdutos.appendChild(article);
    });

    document.querySelectorAll(".adicionar-carrinho").forEach(function (botao) {
      botao.addEventListener("click", function () {
        adicionarAoCarrinho(Number(botao.dataset.id));
      });
    });
  }

  botoesCategoria.forEach(function (botao) {
    botao.addEventListener("click", function () {
      botoesCategoria.forEach(function (item) {
        item.classList.remove("ativa");
      });

      botao.classList.add("ativa");

      categoriaSelecionada = botao.textContent
        .replace("🍮", "")
        .replace("🎂", "")
        .replace("🍰", "")
        .replace("🧁", "")
        .replace("•••", "")
        .trim();

      mostrarProdutos();
    });
  });

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

    carrinho = carrinho.filter(function (item) {
      return produtos.some(function (produto) {
        return Number(produto.id) === Number(item.id);
      });
    });

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

    listaProdutos.innerHTML = `
      <p class="sem-produtos">
        Não foi possível carregar os produtos.
      </p>
    `;
  }
});
