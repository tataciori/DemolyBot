export default {
    command: ["verdesc"], // Novo comando só para ver
    description: "Mostra a descrição atual do grupo.",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: '❌ Comando apenas para grupos.' });
            }

            const metadata = await sock.groupMetadata(chatId);
            const description = metadata.desc || "Este grupo não tem descrição definida."; // Pega a descrição

            await sock.sendMessage(chatId, { text: `📝 *Descrição Atual do Grupo:*\n\n${description}` });

        } catch (e) {
            console.error("Erro no comando !verdesc:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao tentar ver a descrição." });
        }
    }
};