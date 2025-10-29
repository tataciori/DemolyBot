// /plugins/Moderacao/antifake.js
import { carregarGruposConfig, salvarGruposConfig } from '../../main.js';
import { isBotAdmin } from '../utils/checkAdmin.js';

export default {
    command: ["antifake"], // Apenas este comando, sem "aviso"
    description: "Ativa/desativa a remoção automática de números não-brasileiros (+55).",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            const senderId = msg.key.participant;

            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: "Este comando só funciona em grupos." }, { quoted: msg });
            }

            // Verifica se quem usou o comando é admin
            const metadata = await sock.groupMetadata(chatId);
            const senderIsAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));

            if (!senderIsAdmin) {
                return await sock.sendMessage(chatId, { text: "❌ Apenas administradores podem usar este comando." }, { quoted: msg });
            }

            // Verifica se o BOT é admin
            const botIsAdmin = await isBotAdmin(sock, chatId);
            if (!botIsAdmin) {
                 return await sock.sendMessage(chatId, { text: "⚠️ Eu preciso ser administrador para ativar/desativar esta função." }, { quoted: msg });
            }

            const option = args[0]?.toLowerCase();
            const gruposConfig = carregarGruposConfig();

            if (!gruposConfig[chatId]) {
                gruposConfig[chatId] = {};
            }

            if (option === 'on' || option === 'ativar') {
                gruposConfig[chatId].antifake = true; // Salva a configuração
                salvarGruposConfig(gruposConfig);
                await sock.sendMessage(chatId, { text: "✅ Anti-Fake ativado! Números não-brasileiros serão removidos." }, { quoted: msg });
            } else if (option === 'off' || option === 'desativar') {
                gruposConfig[chatId].antifake = false; // Salva a configuração
                salvarGruposConfig(gruposConfig);
                await sock.sendMessage(chatId, { text: "❌ Anti-Fake desativado." }, { quoted: msg });
            } else {
                const status = gruposConfig[chatId]?.antifake ? 'Ativado' : 'Desativado';
                await sock.sendMessage(chatId, { text: `ℹ️ O sistema Anti-Fake está *${status}*.\n\nUse *!antifake on* ou *!antifake off*.` }, { quoted: msg });
            }
        } catch (e) {
             console.error("Erro no comando !antifake:", e);
             await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao configurar o Anti-Fake." });
        }
    }
};