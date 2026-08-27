document.addEventListener("DOMContentLoaded", async function () {
  const listaProdutos = document.getElementById("listaProdutos");

  const carrinhoVazio = document.getElementById("carrinhoVazio");

  const aside = document.querySelector("aside");

  const subtotalElemento = document.getElementById("subtotalCarrinho");

  const freteElemento = document.getElementById("freteCarrinho");

  const totalElemento = document.getElementById("totalCarrinho");

  const botaoFinalizar = document.getElementById("botaoFinalizar");

  const FRETE = 10;

  let carrinho = [];

  try {
    const dados = localStorage.getItem("carrinho");

    if (dados) {
      carrinho = JSON.parse(dados);
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

  async function sincronizarProdutos() {
    try {
      const resposta = await fetch(
  `${API_URL}/api/produtos`
)

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar os produtos.");
      }

      const produtos = await resposta.json();

      carrinho = carrinho
        .filter(function (itemCarrinho) {
          return produtos.some(function (produto) {
            return Number(produto.id) === Number(itemCarrinho.id);
          });
        })
        .map(function (itemCarrinho) {
          const produtoAtual = produtos.find(function (produto) {
            return Number(produto.id) === Number(itemCarrinho.id);
          });

          return {
            id: Number(produtoAtual.id),
            nome: produtoAtual.nome,
            preco: Number(produtoAtual.preco),
            imagem: produtoAtual.imagem || "",
            quantidade: Number(itemCarrinho.quantidade) || 1,
          };
        });

      salvarCarrinho();
    } catch (erro) {
      console.error("Erro ao sincronizar produtos:", erro);
    }
  }

  function calcularSubtotal() {
    let subtotal = 0;

    carrinho.forEach(function (produto) {
      subtotal += Number(produto.preco) * Number(produto.quantidade);
    });

    return subtotal;
  }

  function atualizarTotal() {
    if (carrinho.length === 0) {
      subtotalElemento.textContent = "";
      freteElemento.textContent = "";
      totalElemento.textContent = "";

      return;
    }

    const subtotal = calcularSubtotal();

    const total = subtotal + FRETE;

    subtotalElemento.textContent = formatarPreco(subtotal);

    freteElemento.textContent = formatarPreco(FRETE);

    totalElemento.textContent = formatarPreco(total);
  }

  function mostrarCarrinho() {
    listaProdutos.innerHTML = "";

    if (carrinho.length === 0) {
      carrinhoVazio.style.display = "block";

      aside.style.display = "none";

      botaoFinalizar.style.display = "none";

      atualizarTotal();

      return;
    }

    carrinhoVazio.style.display = "none";

    aside.style.display = "block";

    botaoFinalizar.style.display = "inline-block";

    carrinho.forEach(function (produto) {
      const subtotal = Number(produto.preco) * Number(produto.quantidade);

      const article = document.createElement("article");

      if (produto.imagem) {
        const imagem = document.createElement("img");

        imagem.src = produto.imagem;

        imagem.alt = produto.nome;

        article.appendChild(imagem);
      }

      const titulo = document.createElement("h2");

      titulo.textContent = produto.nome;

      article.appendChild(titulo);

      const preco = document.createElement("p");

      preco.textContent = "Preço: " + formatarPreco(produto.preco);

      article.appendChild(preco);

      const quantidade = document.createElement("p");

      quantidade.append("Quantidade: ");

      const botaoDiminuir = document.createElement("button");

      botaoDiminuir.type = "button";

      botaoDiminuir.className = "diminuir";

      botaoDiminuir.dataset.id = produto.id;

      botaoDiminuir.textContent = "-";

      quantidade.appendChild(botaoDiminuir);

      const quantidadeTexto = document.createElement("span");

      quantidadeTexto.textContent = produto.quantidade;

      quantidade.appendChild(quantidadeTexto);

      const botaoAumentar = document.createElement("button");

      botaoAumentar.type = "button";

      botaoAumentar.className = "aumentar";

      botaoAumentar.dataset.id = produto.id;

      botaoAumentar.textContent = "+";

      quantidade.appendChild(botaoAumentar);

      article.appendChild(quantidade);

      const subtotalElementoProduto = document.createElement("p");

      subtotalElementoProduto.textContent =
        "Subtotal: " + formatarPreco(subtotal);

      article.appendChild(subtotalElementoProduto);

      const botaoRemover = document.createElement("button");

      botaoRemover.type = "button";

      botaoRemover.className = "remover";

      botaoRemover.dataset.id = produto.id;

      botaoRemover.textContent = "Remover";

      article.appendChild(botaoRemover);

      listaProdutos.appendChild(article);
    });

    atualizarTotal();
    configurarBotoes();
  }

  function aumentarQuantidade(id) {
    const produto = carrinho.find(function (item) {
      return Number(item.id) === Number(id);
    });

    if (!produto) {
      return;
    }

    produto.quantidade += 1;

    salvarCarrinho();
    mostrarCarrinho();
  }

  function diminuirQuantidade(id) {
    const produto = carrinho.find(function (item) {
      return Number(item.id) === Number(id);
    });

    if (!produto) {
      return;
    }

    produto.quantidade -= 1;

    if (produto.quantidade <= 0) {
      removerProduto(id);
      return;
    }

    salvarCarrinho();
    mostrarCarrinho();
  }

  function removerProduto(id) {
    carrinho = carrinho.filter(function (item) {
      return Number(item.id) !== Number(id);
    });

    salvarCarrinho();
    mostrarCarrinho();
  }

  function configurarBotoes() {
    document.querySelectorAll(".aumentar").forEach(function (botao) {
      botao.addEventListener("click", function () {
        aumentarQuantidade(Number(botao.dataset.id));
      });
    });

    document.querySelectorAll(".diminuir").forEach(function (botao) {
      botao.addEventListener("click", function () {
        diminuirQuantidade(Number(botao.dataset.id));
      });
    });

    document.querySelectorAll(".remover").forEach(function (botao) {
      botao.addEventListener("click", function () {
        removerProduto(Number(botao.dataset.id));
      });
    });
  }

  await sincronizarProdutos();

  mostrarCarrinho();
});
