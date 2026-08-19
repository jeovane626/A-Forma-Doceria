const produtos = [
  {
    id: 1,
    nome: "Pudim Tradicional",
    preco: 10.0,
  },
  {
    id: 2,
    nome: "Pudim de Geleia de Morango",
    preco: 11.5,
  },
  {
    id: 3,
    nome: "Picolé de Pudim",
    preco: 5.0,
  },
];

document.addEventListener("DOMContentLoaded", function () {
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
    console.error("Erro ao carregar o carrinho:", erro);
    carrinho = [];
  }

  carrinho = carrinho.filter(function (item) {
    return produtos.some(function (produto) {
      return produto.id === Number(item.id);
    });
  });

  carrinho.forEach(function (item) {
    const produto = produtos.find(function (produto) {
      return produto.id === Number(item.id);
    });

    if (produto) {
      item.id = produto.id;
      item.nome = produto.nome;
      item.preco = produto.preco;

      item.quantidade = Number(item.quantidade);

      if (item.quantidade < 1 || isNaN(item.quantidade)) {
        item.quantidade = 1;
      }
    }
  });

  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  const botoesAdicionar = document.querySelectorAll(".adicionar-carrinho");

  botoesAdicionar.forEach(function (botao) {
    botao.addEventListener("click", function () {
      const id = Number(botao.getAttribute("data-id"));

      const produto = produtos.find(function (item) {
        return item.id === id;
      });

      if (!produto) {
        console.error("Produto não encontrado. ID:", id);

        return;
      }

      const produtoExistente = carrinho.find(function (item) {
        return item.id === produto.id;
      });

      if (produtoExistente) {
        produtoExistente.quantidade += 1;
      } else {
        carrinho.push({
          id: produto.id,

          nome: produto.nome,

          preco: produto.preco,

          quantidade: 1,
        });
      }

      localStorage.setItem("carrinho", JSON.stringify(carrinho));

      alert(produto.nome + " foi adicionado ao carrinho!");
    });
  });
});
