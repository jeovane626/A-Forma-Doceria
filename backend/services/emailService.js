const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function enviarEmailRecuperacao(destinatario, linkRecuperacao) {
  try {
    const resultado = await resend.emails.send({
      from: "A Forma Doceria <onboarding@resend.dev>",
      to: destinatario,
      subject: "Redefinição de senha - A Forma Doceria",
      html: `
        <h2>Redefinição de senha</h2>
        <p>Você solicitou a redefinição da sua senha.</p>
        <p>Clique no link abaixo:</p>
        <p>
          <a href="${linkRecuperacao}">
            Redefinir minha senha
          </a>
        </p>
        <p>Este link expira em 30 minutos.</p>
        <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
      `
    });

    console.log("E-mail enviado pelo Resend:", resultado.data?.id);
    return resultado;
  } catch (erro) {
    console.error("Erro ao enviar e-mail pelo Resend:", erro);
    throw erro;
  }
}

module.exports = {
  enviarEmailRecuperacao
};