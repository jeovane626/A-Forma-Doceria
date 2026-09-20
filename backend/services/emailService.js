const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function enviarEmailRecuperacao(destinatario, linkRecuperacao) {
  try {
    const { data, error } = await resend.emails.send({
      from: "A Forma Doceria <onboarding@resend.dev>",
      to: destinatario,
      subject: "Redefinição de senha - A Forma Doceria",
      html: `
        <h2>Redefinição de senha</h2>

        <p>Você solicitou a redefinição da sua senha.</p>

        <p>Clique no link abaixo para criar uma nova senha:</p>

        <p>
          <a href="${linkRecuperacao}">
            Redefinir minha senha
          </a>
        </p>

        <p>Este link expira em 30 minutos.</p>

        <p>
          Se você não solicitou essa alteração,
          ignore este e-mail.
        </p>
      `
    });

    if (error) {
      console.error("Erro retornado pelo Resend:", error);
      throw new Error(error.message || "Erro ao enviar e-mail pelo Resend");
    }

    console.log("E-mail enviado pelo Resend. ID:", data?.id);

    return data;
  } catch (erro) {
    console.error("Falha no envio pelo Resend:", erro);
    throw erro;
  }
}

module.exports = {
  enviarEmailRecuperacao
};