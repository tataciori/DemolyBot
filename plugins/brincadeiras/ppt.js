import config from '../../config.js'; 

export default {
    command: ["ppt", "jokenpo"],
    description: "Joga Pedra, Papel ou Tesoura com o bot.",

    async run(sock, msg, args) { 
        const chatId = msg.key.remoteJid;
        const prefix = config.prefix || '!';
        const suaEscolha = args[0]?.toLowerCase(); // Pega a escolha do usuário (pedra, papel, tesoura)

        // Verifica se o usuário escolheu uma opção válida
        const opcoesValidas = ['pedra', 'papel', 'tesoura'];
        if (!suaEscolha || !opcoesValidas.includes(suaEscolha)) {
            return await sock.sendMessage(chatId, { 
                text: `⚔️ Como jogar Pedra, Papel ou Tesoura ⚔️\n\nEscolha um e digite:\n• ${prefix}ppt pedra\n• ${prefix}ppt papel\n• ${prefix}ppt tesoura`
            }, { quoted: msg });
        }

        try {
            // Bot escolhe aleatoriamente
            const botEscolha = opcoesValidas[Math.floor(Math.random() * opcoesValidas.length)];

            let resultado = '';
            let emojiSua = '';
            let emojiBot = '';

            // Define emojis para as escolhas
            const emojiMap = { 'pedra': '🗿', 'papel': '📄', 'tesoura': '✂️' };
            emojiSua = emojiMap[suaEscolha];
            emojiBot = emojiMap[botEscolha];

            // Lógica do Jogo
            if (suaEscolha === botEscolha) {
                resultado = "Empatamos! 😐";
            } else if (
                (suaEscolha === 'pedra' && botEscolha === 'tesoura') ||
                (suaEscolha === 'papel' && botEscolha === 'pedra') ||
                (suaEscolha === 'tesoura' && botEscolha === 'papel')
            ) {
                resultado = "Você ganhou! 🎉 Parabéns!";
            } else {
                resultado = "Eu ganhei! 🥳 Tente de novo!";
            }

            // Monta a resposta
            const textoResposta = `
*⚔️ JOKENPÔ ⚔️*

Você escolheu: ${emojiSua} (${suaEscolha})
Eu escolhi: ${emojiBot} (${botEscolha})

Resultado: *${resultado}*
            `.trim();

            await sock.sendMessage(chatId, { text: textoResposta }, { quoted: msg });

        } catch (err) {
            console.error("Erro no comando !ppt:", err);
            await sock.sendMessage(chatId, { text: "❌ Ocorreu um erro ao tentar jogar." }, { quoted: msg });
        }
    }
};