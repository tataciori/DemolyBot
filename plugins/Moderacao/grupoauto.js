import { carregarGruposConfig, salvarGruposConfig } from '../../main.js';
import { isBotAdmin } from '../utils/checkAdmin.js'; // Precisamos verificar se o bot é admin

export default {
    command: ["grupoauto"],
    description: "Ativa/desativa a abertura (7h) e fechamento (22h) automáticos do grupo.",

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

            // Verifica se o BOT é admin (necessário para mudar as configs)
            const botIsAdmin = await isBotAdmin(sock, chatId);
            if (!botIsAdmin) {
                 return await sock.sendMessage(chatId, { text: "⚠️ Eu preciso ser administrador neste grupo para poder controlar a abertura/fechamento automático." }, { quoted: msg });
            }

            const option = args[0]?.toLowerCase();
            const gruposConfig = carregarGruposConfig();

            if (!gruposConfig[chatId]) {
                gruposConfig[chatId] = {};
            }

            if (option === 'on' || option === 'ativar') {
                gruposConfig[chatId].abrirFecharAuto = true;
                salvarGruposConfig(gruposConfig);
                await sock.sendMessage(chatId, { text: "✅ Abertura (7h) e fechamento (22h) automáticos ATIVADOS." }, { quoted: msg });
            } else if (option === 'off' || option === 'desativar') {
                gruposConfig[chatId].abrirFecharAuto = false;
                salvarGruposConfig(gruposConfig);
                await sock.sendMessage(chatId, { text: "❌ Abertura e fechamento automáticos DESATIVADOS." }, { quoted: msg });
            } else {
                const status = gruposConfig[chatId]?.abrirFecharAuto ? 'Ativado' : 'Desativado';
                await sock.sendMessage(chatId, { text: `ℹ️ O sistema de abertura/fechamento automático está *${status}*.\n\nUse *!grupoauto on* ou *!grupoauto off*.` }, { quoted: msg });
            }
        } catch (e) {
             console.error("Erro no comando !grupoauto:", e);
             await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao configurar a automação do grupo." });
        }
    }
};