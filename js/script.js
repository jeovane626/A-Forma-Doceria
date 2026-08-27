document.addEventListener("DOMContentLoaded", async function () {
  const listaProdutos = document.getElementById("listaProdutosLoja");

  let produtos = [];

  let carrinho = [];

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

    if (produtos.length === 0) {
      listaProdutos.innerHTML = `
        <p>
          Nenhum produto disponível no momento.
        </p>
      `;

      return;
    }

    produtos.forEach(function (produto) {
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

  try {
    const resposta = await fetch(
  `${API_URL}/api/produtos`
)

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os produtos.");
    }

    produtos = await resposta.json();

    produtos = produtos.map(function (produto) {
      return {
        ...produto,

        id: Number(produto.id),

        preco: Number(produto.preco),
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
      <p>
        Não foi possível carregar os produtos.
      </p>
    `;
  }
});
