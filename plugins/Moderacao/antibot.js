// /plugins/Moderacao/antibot.js
import { carregarGruposConfig, salvarGruposConfig } from '../../main.js';
import { isBotAdmin } from '../utils/checkAdmin.js'; // Importa a ferramenta de verificação

export default {
    command: ["antibot"],
    description: "Ativa ou desativa o sistema de remoção automática de outros bots.",
    
    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            const senderId = msg.key.participant;

            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: "Este comando só pode ser usado em grupos." }, { quoted: msg });
            }

            // Verifica se quem usou o comando é admin
            const metadata = await sock.groupMetadata(chatId);
            const senderIsAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
            
            if (!senderIsAdmin) {
                return await sock.sendMessage(chatId, { text: "❌ Apenas administradores do grupo podem usar este comando." }, { quoted: msg });
            }

            // Verifica se o BOT é admin (necessário para remover outros)
            const botIsAdmin = await isBotAdmin(sock, chatId);
            if (!botIsAdmin) {
                 return await sock.sendMessage(chatId, { text: "⚠️ Eu preciso ser administrador para ativar ou desativar esta função." }, { quoted: msg });
            }

            const option = args[0]?.toLowerCase();
            const gruposConfig = carregarGruposConfig();

            if (!gruposConfig[chatId]) {
                gruposConfig[chatId] = {};
            }

            if (option === 'on' || option === 'ativar') {
                gruposConfig[chatId].antibot = true;
                salvarGruposConfig(gruposConfig);
                await sock.sendMessage(chatId, { text: "✅ Sistema Anti-Bot ativado! Outros bots que entrarem serão removidos." }, { quoted: msg });
            } else if (option === 'off' || option === 'desativar') {
                gruposConfig[chatId].antibot = false;
                salvarGruposConfig(gruposConfig);
                await sock.sendMessage(chatId, { text: "❌ Sistema Anti-Bot desativado." }, { quoted: msg });
            } else {
                const status = gruposConfig[chatId]?.antibot ? 'Ativado' : 'Desativado';
                await sock.sendMessage(chatId, { text: `ℹ️ O sistema Anti-Bot está atualmente *${status}*.\n\nUse *!antibot on* para ativar ou *!antibot off* para desativar.` }, { quoted: msg });
            }
        } catch (e) {
             console.error("Erro no comando !antibot:", e);
             await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao configurar o Anti-Bot." });
        }
    }
};