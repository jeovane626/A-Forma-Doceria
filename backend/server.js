require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const pool = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin.Routes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

const origemProducao = process.env.FRONTEND_ORIGIN;

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requisições sem origin, como Postman
      if (!origin) {
        return callback(null, true);
      }

      // Permite localhost durante desenvolvimento
      const origemLocal =
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

      if (origemLocal || origin === origemProducao) {
        return callback(null, true);
      }

      console.error("Origem bloqueada pelo CORS:", origin);

      return callback(
        new Error("Origem não permitida pelo CORS.")
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);

// Permite JSON
app.use(express.json());

// Permite formulários
app.use(
  express.urlencoded({
    extended: true
  })
);

// Headers de segurança
app.use(helmet());

// Limite geral de requisições
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/produtos", productRoutes);
app.use("/api/upload", uploadRoutes);

// Rota principal
app.get("/", (req, res) => {
  res.json({
    mensagem: "Backend da A Forma Doceria funcionando!"
  });
});

// Teste do banco
app.get("/api/teste-banco", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT NOW() AS data_atual"
    );

    res.json({
      mensagem: "Conexão com o banco realizada com sucesso!",
      banco: resultado.rows[0]
    });
  } catch (erro) {
    console.error("Erro ao testar banco:", erro);

    res.status(500).json({
      erro: "Não foi possível conectar ao banco de dados."
    });
  }
});

// Tratamento geral de erros
app.use((erro, req, res, next) => {
  console.error("Erro no servidor:", erro.message);

  if (erro.message === "Origem não permitida pelo CORS.") {
    return res.status(403).json({
      erro: "Origem não permitida."
    });
  }

  return res.status(500).json({
    erro: "Erro interno do servidor."
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Servidor rodando em http://localhost:${PORT}`
  );
});
