export default {
    command: ['itotag','hidetag', 'marcar', 'todos'],
    description: 'Menciona todos os membros do grupo em uma mensagem.',
    
    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            // Verifica se o comando foi usado em um grupo
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: 'Este comando só funciona em grupos.' });
            }

            // Pega o ID de quem enviou a mensagem
            const senderId = msg.key.participant;

            // Pega as informações do grupo para saber quem são os admins
            const groupMetadata = await sock.groupMetadata(chatId);
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

            // VERIFICAÇÃO DE ADMIN: Apenas admins podem usar este comando para evitar spam
            if (!admins.includes(senderId)) {
                return await sock.sendMessage(chatId, { text: "❌ Apenas administradores podem usar este comando para marcar todos." }, { quoted: msg });
            }

            const text = args.join(' ');
            if (!text) {
                return await sock.sendMessage(chatId, { text: "✍️ Por favor, digite a mensagem que você quer enviar para todos.\nExemplo: *!hidetag Reunião importante amanhã!*" }, { quoted: msg });
            }

            // Pega o ID de todos os participantes do grupo
            const participants = groupMetadata.participants.map(p => p.id);

            // Envia a mensagem de texto, mas com a propriedade 'mentions' contendo todos os IDs
            await sock.sendMessage(chatId, { 
                text: text, 
                mentions: participants 
            });

        } catch (e) {
            console.error('Erro no hidetag:', e);
            await sock.sendMessage(chatId, { text: '⚠️ Ocorreu um erro ao tentar marcar todos.' });
        }
    }
};