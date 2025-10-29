import { loadBlacklist } from '../../main.js'; // Importa a função de carregar a lista

export default {
    command: ["listanegra", "verbanidos", "banlist"],
    description: "Mostra a lista de todos os usuários banidos (na blacklist).",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            // --- Verificações Iniciais ---
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: '❌ Este comando só funciona em grupos.' }, { quoted: msg });
            }

            const metadata = await sock.groupMetadata(chatId);
            const senderId = msg.key.participant;
            const senderIsAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
            
            if (!senderIsAdmin) {
                return await sock.sendMessage(chatId, { text: '🚫 Apenas administradores podem ver a lista de banidos.' }, { quoted: msg });
            }

            // --- Lógica do Comando ---
            const blacklist = loadBlacklist(); // Carrega a lista do blacklist.json

            if (blacklist.length === 0) {
                return await sock.sendMessage(chatId, { text: '✅ A lista de banidos está limpa! Ninguém na blacklist.' }, { quoted: msg });
            }

            // Monta o texto da lista
            let textoLista = `🚫 *LISTA DE USUÁRIOS BANIDOS* 🚫\n\nTotal: ${blacklist.length} usuário(s)\n\n`;
            let mentions = [];

            // Adiciona cada usuário banido ao texto e à lista de menções
            blacklist.forEach((userId, index) => {
                textoLista += `${index + 1}. @${userId.split('@')[0]}\n`;
                mentions.push(userId);
            });

            textoLista += "\nEstes usuários não podem entrar em grupos onde o bot estiver.";

            // Envia a lista completa, marcando os usuários
            await sock.sendMessage(chatId, { 
                text: textoLista, 
                mentions: mentions 
            }, { quoted: msg });

        } catch (e) {
            console.error("Erro no comando !listanegra:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao tentar buscar a lista de banidos." });
        }
    }
};