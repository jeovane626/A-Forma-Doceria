const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function enviarEmailRecuperacao(email, token) {
  const linkRecuperacao = `${process.env.FRONTEND_URL}/redefinir-senha.html?token=${token}`;

  await transporter.sendMail({
    from: `"Á Forma, Doceria" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "Redefinição de senha - Á Forma, Doceria",

    html: `
      <h2>Redefinição de senha</h2>

      <p>
        Recebemos uma solicitação para redefinir
        sua senha do painel administrativo.
      </p>

      <p>
        <a href="${linkRecuperacao}">
          Redefinir minha senha
        </a>
      </p>

      <p>
        Este link expira em 30 minutos.
      </p>

      <p>
        Se você não solicitou a alteração,
        ignore este e-mail.
      </p>
    `,
  });
}

module.exports = {
  enviarEmailRecuperacao,
};
