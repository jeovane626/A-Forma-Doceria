document.addEventListener("DOMContentLoaded", async function () {
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

  const produtosCheckout = document.getElementById("produtosCheckout");

  const subtotalCheckout = document.getElementById("subtotalCheckout");

  const freteCheckout = document.getElementById("freteCheckout");

  const totalCheckout = document.getElementById("totalCheckout");

  const formulario = document.getElementById("formularioPedido");

  const botaoConfirmar = document.getElementById("confirmarPedido");

  const areaFormulario = document.getElementById("areaFormulario");

  const resumoPedido = document.getElementById("resumoPedido");

  const acoesPedido = document.getElementById("acoesPedido");

  const FRETE = 10.0;

  let subtotal = 0;
  let total = 0;

  function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  }

  function mostrarCarrinhoVazio() {
    areaFormulario.style.display = "none";
    resumoPedido.style.display = "none";

    acoesPedido.innerHTML = `
      <a href="index.html">
        <button
          type="button"
          class="voltar"
        >
          Voltar para a loja
        </button>
      </a>
    `;
  }

  async function sincronizarCarrinho() {
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
      console.error("Erro ao sincronizar carrinho:", erro);
    }
  }

  function mostrarProdutosCheckout() {
    produtosCheckout.innerHTML = "";

    subtotal = 0;

    carrinho.forEach(function (produto) {
      const subtotalProduto =
        Number(produto.preco) * Number(produto.quantidade);

      subtotal += subtotalProduto;

      const produtoElemento = document.createElement("div");

      produtoElemento.classList.add("produto-checkout");

      produtoElemento.innerHTML = `
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
          Quantidade:
          ${produto.quantidade}
        </p>

        <p>
          Preço:
          ${formatarPreco(produto.preco)}
        </p>

        <p>
          Subtotal:
          ${formatarPreco(subtotalProduto)}
        </p>
      `;

      produtosCheckout.appendChild(produtoElemento);
    });

    total = subtotal + FRETE;

    subtotalCheckout.textContent = formatarPreco(subtotal);

    freteCheckout.textContent = formatarPreco(FRETE);

    totalCheckout.textContent = formatarPreco(total);
  }

  await sincronizarCarrinho();

  if (carrinho.length === 0) {
    mostrarCarrinhoVazio();
    return;
  }

  mostrarProdutosCheckout();

  formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();

    const telefone = document.getElementById("telefone").value.trim();

    const cep = document.getElementById("cep").value.trim();

    const rua = document.getElementById("rua").value.trim();

    const numero = document.getElementById("numero").value.trim();

    const complemento = document.getElementById("complemento").value.trim();

    const bairro = document.getElementById("bairro").value.trim();

    const cidade = document.getElementById("cidade").value.trim();

    const pagamentoSelecionado = document.querySelector(
      'input[name="pagamento"]:checked',
    );

    if (!pagamentoSelecionado) {
      alert("Escolha uma forma de pagamento.");

      return;
    }

    const pagamento = pagamentoSelecionado.value;

    let mensagem = "🍮 Á FORMA, DOCERIA\n\n";

    mensagem += "NOVO PEDIDO\n\n";

    mensagem += "Cliente: " + nome + "\n";

    mensagem += "Telefone: " + telefone + "\n\n";

    mensagem += "ENDEREÇO DE ENTREGA\n";

    mensagem += "CEP: " + cep + "\n";

    mensagem += "Rua: " + rua + ", Nº " + numero + "\n";

    if (complemento !== "") {
      mensagem += "Complemento: " + complemento + "\n";
    }

    mensagem += "Bairro: " + bairro + "\n";

    mensagem += "Cidade: " + cidade + "\n\n";

    mensagem += "PRODUTOS\n\n";

    carrinho.forEach(function (produto) {
      const subtotalProduto =
        Number(produto.preco) * Number(produto.quantidade);

      mensagem += produto.nome + "\n";

      mensagem += "Quantidade: " + produto.quantidade + "\n";

      mensagem += "Subtotal: " + formatarPreco(subtotalProduto) + "\n\n";
    });

    mensagem += "VALORES\n";

    mensagem += "Subtotal: " + formatarPreco(subtotal) + "\n";

    mensagem += "Frete: " + formatarPreco(FRETE) + "\n";

    mensagem += "Total: " + formatarPreco(total) + "\n\n";

    mensagem += "Pagamento: " + pagamento;

    const numeroWhatsApp = "558192519761";

    const linkWhatsApp =
      "https://wa.me/" +
      numeroWhatsApp +
      "?text=" +
      encodeURIComponent(mensagem);

    window.open(linkWhatsApp, "_blank");

    localStorage.removeItem("carrinho");

    botaoConfirmar.disabled = true;
  });
});
