import nodemailer from 'nodemailer';

// Configura o "transportador" de e-mail.
// Certifique-se de que EMAIL_USER e EMAIL_PASS estão no .env
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Envia um e-mail de boas-vindas.
 */
export const sendWelcomeEmail = async (to, name, setupLink) => {
    const mailOptions = {
        from: `"PubliMatch" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Bem-vindo(a) à PubliMatch! Ative sua conta.',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Olá, ${name}!</h2>
                <p>Sua conta na plataforma PubliMatch foi criada com sucesso.</p>
                <p>Para o seu primeiro acesso, por favor, configure uma senha segura clicando no botão abaixo:</p>
                <a href="${setupLink}" target="_blank" style="background-color: #19b5cd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Criar Minha Senha
                </a>
                <p>Este link é válido por 24 horas.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de boas-vindas enviado para ${to}`);
    } catch (error) {
        console.error(`Erro ao enviar e-mail de boas-vindas para ${to}:`, error);
        throw new Error('Falha ao enviar o e-mail de boas-vindas.');
    }
};

/**
 * Envia um e-mail de redefinição de senha com um CÓDIGO numérico.
 */
export const sendPasswordResetCodeEmail = async (to, name, code) => {
    const mailOptions = {
        from: `"PubliMatch" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Seu Código de Redefinição de Senha - PubliMatch',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                <h2 style="color: #750477ff;">Olá, ${name}!</h2>
                <p>Recebemos uma solicitação para redefinir sua senha na plataforma PubliMatch.</p>
                <p>Use o código abaixo para criar uma nova senha. Este código é válido por 10 minutos.</p>
                <div style="background-color: #f2f2f2; padding: 10px 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <h3 style="font-size: 24px; letter-spacing: 5px; margin: 0;">${code}</h3>
                </div>
                <p>Se você não solicitou esta alteração, pode ignorar este e-mail com segurança.</p>
                <p>Atenciosamente,<br>Equipe PubliMatch</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail com código de redefinição enviado para ${to}`);
    } catch (error) {
        console.error(`Erro ao enviar e-mail de redefinição para ${to}:`, error);
        throw new Error('Falha ao enviar o e-mail de redefinição.');
    }
};

// Adiciona uma exportação padrão vazia ou com as funções para compatibilidade, se necessário, 
// mas o ideal é usar as importações nomeadas (com chaves {}) no controlador.
export default { sendWelcomeEmail, sendPasswordResetCodeEmail };
