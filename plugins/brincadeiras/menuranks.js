import config from '../../config.js'; // Importa para usar o prefixo

export default {
    command: ["menuranks", "ranks"], // Comando(s) para chamar este menu
    description: "Exibe a lista de todos os comandos de rank disponíveis.",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            const prefix = config.prefix || '!';

            // Monta o texto do menu de ranks
            const texto = `
🏆 *『 MENU DE RANKS 』* 🏆

Divirta-se com os rankings mais aleatórios (e talvez injustos) do grupo! 😉

• ${prefix}rankbelo   → Top 5 Mais Belos 💅
• ${prefix}rankativo  → Top 5 Mais ativos 🏆
• ${prefix}rankfeio   → Top 5 Mais Feios 👹
• ${prefix}rankrico   → Top 5 Mais Ricos 💰
• ${prefix}rankotario → Top 5 Mais Otários 🤡
• ${prefix}rankgay    → Top 5 Mais Gays 🏳️‍🌈
• ${prefix}rankgostosa→ Top 5 Mais Gostosas 🔥
• ${prefix}ranknerd   → Top 5 Mais Nerds 🤓
• ${prefix}rankcorno  → Top 5 Mais Cornos 🐂
• ${prefix}rankcorna  → Top 5 Mais Cornas 🐮
`;

            await sock.sendMessage(chatId, { text: texto });

        } catch (e) {
            console.error("Erro no menuranks:", e);
            await sock.sendMessage(chatId, { text: '⚠️ Erro ao exibir o menu de ranks.' });
        }
    }
};