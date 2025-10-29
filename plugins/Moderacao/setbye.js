// /plugins/Moderacao/setbye.js
import { carregarGruposConfig, salvarGruposConfig } from '../../main.js';
import { isBotAdmin } from '../utils/checkAdmin.js';

export default {
    command: ["setbye", "delbye"],
    description: "Define ou remove a(s) mensagem(ns) de despedida do grupo. Use '///' para separar várias mensagens aleatórias.",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            const senderId = msg.key.participant;
            const commandUsed = (msg.message?.conversation || msg.message?.extendedTextMessage?.text)?.split(' ')[0].slice(1).toLowerCase();

            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: "❌ Comando apenas para grupos." });
            }

            const metadata = await sock.groupMetadata(chatId);
            const senderIsAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
            if (!senderIsAdmin) {
                return await sock.sendMessage(chatId, { text: "🚫 Apenas administradores podem configurar isso." });
            }

            const gruposConfig = carregarGruposConfig();
            if (!gruposConfig[chatId]) gruposConfig[chatId] = {};

            // Comando !delbye
            if (commandUsed === 'delbye') {
                delete gruposConfig[chatId].byeMsg; // Remove a configuração
                salvarGruposConfig(gruposConfig);
                return await sock.sendMessage(chatId, { text: "✅ Mensagem(ns) de despedida removida(s)." });
            }

            // Comando !setbye
            const newByeMsg = args.join(" ");
            if (!newByeMsg) {
                return await sock.sendMessage(chatId, { text: "✍️ Digite a mensagem após o comando.\n*Exemplo 1 (única):* `!setbye Tchau @usuario!`\n*Exemplo 2 (aleatória):* `!setbye @usuario saiu /// @usuario foi jogar no Vasco /// @usuario foi comprar cigarro`" });
            }

            gruposConfig[chatId].byeMsg = newByeMsg; // Salva a string (com ou sem '///')
            salvarGruposConfig(gruposConfig);

            if (newByeMsg.includes('///')) {
                await sock.sendMessage(chatId, { text: "✅ Mensagens de despedida aleatórias definidas com sucesso!" });
            } else {
                await sock.sendMessage(chatId, { text: "✅ Mensagem de despedida única definida com sucesso!" });
            }

        } catch (e) {
            console.error("Erro em setbye/delbye:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro." });
        }
    }
};