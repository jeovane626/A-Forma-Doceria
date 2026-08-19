document.addEventListener("DOMContentLoaded", function () {
    const listaProdutos = document.getElementById("listaProdutos");
    const carrinhoVazio = document.getElementById("carrinhoVazio");
    const aside = document.querySelector("aside");
    const subtotalElemento = document.getElementById("subtotalCarrinho");
    const freteElemento = document.getElementById("freteCarrinho");
    const totalElemento = document.getElementById("totalCarrinho");
    const botaoFinalizar = document.getElementById("botaoFinalizar");

    const FRETE = 10.00;

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

    carrinho = carrinho
        .filter(function (produto) {
            return produto &&
                produto.id !== undefined &&
                produto.preco !== undefined;
        })
        .map(function (produto) {
            return {
                id: Number(produto.id),
                nome: produto.nome,
                preco: Number(produto.preco),
                quantidade: Number(produto.quantidade) || 1
            };
        });

    salvarCarrinho();


    function salvarCarrinho() {
        localStorage.setItem(
            "carrinho",
            JSON.stringify(carrinho)
        );
    }


    function formatarPreco(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }


    function calcularSubtotal() {
        let subtotal = 0;

        carrinho.forEach(function (produto) {
            subtotal += produto.preco * produto.quantidade;
        });

        return subtotal;
    }


    function atualizarTotal() {
        const subtotal = calcularSubtotal();

        subtotalElemento.textContent =
            formatarPreco(subtotal);

        if (carrinho.length === 0) {
            freteElemento.textContent = "";
            totalElemento.textContent = "";
            return;
        }

        freteElemento.textContent =
            formatarPreco(FRETE);

        totalElemento.textContent =
            formatarPreco(subtotal + FRETE);
    }


    function obterImagem(id) {
        if (id === 1) {
            return "imagens/tradicional.jpg";
        }

        if (id === 2) {
            return "imagens/Geleia.jpg";
        }

        if (id === 3) {
            return "imagens/picole.jpg";
        }

        return "";
    }


    function mostrarCarrinho() {

        listaProdutos.innerHTML = "";

        if (carrinho.length === 0) {

            carrinhoVazio.style.display = "block";
            aside.style.display = "none";
            botaoFinalizar.style.display = "none";

            subtotalElemento.textContent = "";
            freteElemento.textContent = "";
            totalElemento.textContent = "";

            return;
        }


        carrinhoVazio.style.display = "none";
        aside.style.display = "block";
        botaoFinalizar.style.display = "inline-block";


        carrinho.forEach(function (produto) {

            const subtotalProduto =
                produto.preco * produto.quantidade;

            const article =
                document.createElement("article");


            article.innerHTML = `
                <img
                    src="${obterImagem(produto.id)}"
                    alt="${produto.nome}"
                >

                <h2>
                    ${produto.nome}
                </h2>

                <p>
                    Preço:
                    ${formatarPreco(produto.preco)}
                </p>

                <p>
                    Quantidade:

                    <button
                        type="button"
                        class="diminuir"
                        data-id="${produto.id}"
                    >
                        -
                    </button>

                    <span>
                        ${produto.quantidade}
                    </span>

                    <button
                        type="button"
                        class="aumentar"
                        data-id="${produto.id}"
                    >
                        +
                    </button>
                </p>

                <p>
                    Subtotal:
                    ${formatarPreco(subtotalProduto)}
                </p>

                <button
                    type="button"
                    class="remover"
                    data-id="${produto.id}"
                >
                    Remover
                </button>
            `;

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

        document
            .querySelectorAll(".aumentar")
            .forEach(function (botao) {

                botao.addEventListener("click", function () {

                    const id =
                        Number(botao.dataset.id);

                    aumentarQuantidade(id);
                });
            });


        document
            .querySelectorAll(".diminuir")
            .forEach(function (botao) {

                botao.addEventListener("click", function () {

                    const id =
                        Number(botao.dataset.id);

                    diminuirQuantidade(id);
                });
            });


        document
            .querySelectorAll(".remover")
            .forEach(function (botao) {

                botao.addEventListener("click", function () {

                    const id =
                        Number(botao.dataset.id);

                    removerProduto(id);
                });
            });
    }


    mostrarCarrinho();
});