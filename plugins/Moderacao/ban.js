import { loadBlacklist, saveBlacklist } from '../../main.js';
import { isBotAdmin } from '../utils/checkAdmin.js';
import { areJidsSameUser } from '@whiskeysockets/baileys'; // <<< LINHA ADICIONADA AQUI

export default {
    command: ['ban', 'kick'],
    description: 'Remove um membro do grupo. O comando !ban também adiciona à blacklist.',

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
                return await sock.sendMessage(chatId, { text: '🚫 Apenas administradores podem usar este comando.' });
            }

            const botIsAdmin = await isBotAdmin(sock, chatId);
            if (!botIsAdmin) {
                return await sock.sendMessage(chatId, { text: '⚠️ Eu preciso ser *administrador* para executar esta ação!' });
            }

            const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = mentioned || quoted;

            if (!target) {
                return await sock.sendMessage(chatId, { text: "❓ Por favor, marque um usuário (@) ou responda à mensagem de quem você quer remover." });
            }

            const botId = sock.user.id;
            // Agora a função areJidsSameUser será encontrada
            if (areJidsSameUser(target, botId)) return await sock.sendMessage(chatId, { text: "😅 Eu não posso fazer isso comigo mesmo." });
            
            const targetIsAdmin = metadata.participants.some(p => p.id === target && (p.admin === 'admin' || p.admin === 'superadmin'));
            if (targetIsAdmin) return await sock.sendMessage(chatId, { text: "❌ Não posso remover outro administrador." });

            const commandUsed = (msg.message?.conversation || msg.message?.extendedTextMessage?.text)?.split(' ')[0].toLowerCase() || "";
            let successMessage = `✅ O usuário @${target.split('@')[0]} foi removido com sucesso.`;

            if (commandUsed.includes('ban')) {
                const blacklist = loadBlacklist();
                if (!blacklist.includes(target)) {
                    blacklist.push(target);
                    saveBlacklist(blacklist);
                    successMessage = `✅ O usuário @${target.split('@')[0]} foi **banido** (removido e adicionado à blacklist).`;
                } else {
                    successMessage = `✅ O usuário @${target.split('@')[0]} já estava na blacklist e foi removido novamente.`;
                }
            }

            await sock.groupParticipantsUpdate(chatId, [target], 'remove');
            await sock.sendMessage(chatId, { text: successMessage, mentions: [target] });

        } catch (e) {
            console.error("Erro no comando ban/kick:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao tentar executar o comando." });
        }
    }
};