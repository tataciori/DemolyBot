import { isBotAdmin } from '../utils/checkAdmin.js'; 

export default {
    command: ["setdesc", "descgp"], // Mantém !descgp como um apelido
    description: "Altera a descrição do grupo.",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: '❌ Comando apenas para grupos.' });
            }

            const metadata = await sock.groupMetadata(chatId);
            const senderId = msg.key.participant;
            const senderIsAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
            
            if (!senderIsAdmin) {
                return await sock.sendMessage(chatId, { text: '🚫 Apenas administradores podem alterar a descrição.' });
            }

            const botIsAdmin = await isBotAdmin(sock, chatId);
            if (!botIsAdmin) {
                return await sock.sendMessage(chatId, { text: '⚠️ Eu preciso ser *administrador* para alterar a descrição!' });
            }

            const newDescription = args.join(" "); 
            // AGORA, se não houver texto, ele avisa que precisa de um
            if (!newDescription && newDescription !== "") { 
                 return await sock.sendMessage(chatId, { text: "✍️ Por favor, digite a nova descrição após o comando.\nExemplo: `!setdesc Bem-vindos!`\n(Use `!setdesc` sem nada para limpar a descrição)." });
            }
            
            if (newDescription.length > 500) { 
                 return await sock.sendMessage(chatId, { text: "❌ A descrição é muito longa!" });
            }

            await sock.groupUpdateDescription(chatId, newDescription);
            
            await sock.sendMessage(chatId, { text: `✅ Descrição do grupo atualizada!` });

        } catch (e) {
            console.error("Erro no comando !setdesc:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao tentar alterar a descrição." });
        }
    }
};