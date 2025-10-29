import { carregarGruposConfig, salvarGruposConfig } from '../../main.js';
import { isBotAdmin } from '../utils/checkAdmin.js'; // Importa nossa ferramenta!

const LIMITE_ADVERTENCIAS = 3; // Você pode mudar o limite aqui

export default {
    command: ['advertir', 'veradv', 'resetadv'],
    description: `Gerencia as advertências de um membro. Com ${LIMITE_ADVERTENCIAS} advertências, o membro é removido.`,
    
    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            // --- Verificações Iniciais ---
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: '❌ Comando apenas para grupos.' });
            }

            const metadata = await sock.groupMetadata(chatId);
            const senderId = msg.key.participant;
            const senderIsAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));

            if (!senderIsAdmin) {
                return await sock.sendMessage(chatId, { text: '🚫 Apenas administradores podem usar este comando.' });
            }

            const botIsAdmin = await isBotAdmin(sock, chatId); // Usa nossa ferramenta!

            // Identifica qual dos 3 comandos foi usado
            const commandUsed = (msg.message?.conversation || msg.message?.extendedTextMessage?.text)?.split(' ')[0].slice(1).toLowerCase();
            const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant;

            const configGrupos = carregarGruposConfig();
            if (!configGrupos[chatId]) configGrupos[chatId] = {};
            if (!configGrupos[chatId].warnings) configGrupos[chatId].warnings = {};
            const warnings = configGrupos[chatId].warnings;

            // --- Lógica do !advertir ---
            if (commandUsed === 'advertir') {
                if (!target) return await sock.sendMessage(chatId, { text: '❌ Marque alguém (@) ou responda à mensagem de quem você quer advertir.' });
                if (target === senderId) return await sock.sendMessage(chatId, { text: '😅 Você não pode se advertir!' });
                
                const targetIsAdmin = metadata.participants.some(p => p.id === target && (p.admin === 'admin' || p.admin === 'superadmin'));
                if (targetIsAdmin) return await sock.sendMessage(chatId, { text: '❌ Não é possível advertir um administrador.' });

                warnings[target] = (warnings[target] || 0) + 1;
                salvarGruposConfig(configGrupos);

                if (warnings[target] >= LIMITE_ADVERTENCIAS) {
                    if (botIsAdmin) {
                        await sock.sendMessage(chatId, { text: `🚨 @${target.split('@')[0]} atingiu ${LIMITE_ADVERTENCIAS} advertências e foi *REMOVIDO* do grupo!`, mentions: [target] });
                        await sock.groupParticipantsUpdate(chatId, [target], 'remove');
                        delete warnings[target]; // Limpa as advertências após a remoção
                        salvarGruposConfig(configGrupos);
                    } else {
                        await sock.sendMessage(chatId, { text: `🚨 @${target.split('@')[0]} atingiu o limite de ${LIMITE_ADVERTENCIAS} advertências! Eu não sou admin, então não posso removê-lo.`, mentions: [target] });
                    }
                } else {
                    await sock.sendMessage(chatId, { text: `⚠️ @${target.split('@')[0]} recebeu uma advertência. Total: *${warnings[target]}* de ${LIMITE_ADVERTENCIAS}.`, mentions: [target] });
                }
            }

            // --- Lógica do !veradv ---
            else if (commandUsed === 'veradv') {
                if (target) {
                    const count = warnings[target] || 0;
                    await sock.sendMessage(chatId, { text: `🔍 @${target.split('@')[0]} tem *${count}* advertência(s) de ${LIMITE_ADVERTENCIAS}.`, mentions: [target] });
                } else {
                    let text = `📋 *Advertências do grupo* (Limite: ${LIMITE_ADVERTENCIAS}):\n\n`;
                    const warnedUsers = Object.keys(warnings).filter(id => warnings[id] > 0);
                    if (warnedUsers.length === 0) {
                        text += 'Nenhuma advertência registrada.';
                    } else {
                        text += warnedUsers.map(id => `• @${id.split('@')[0]} → ${warnings[id]} adv.`).join('\n');
                    }
                    await sock.sendMessage(chatId, { text: text, mentions: warnedUsers });
                }
            }

            // --- Lógica do !resetadv ---
            else if (commandUsed === 'resetadv') {
                if (target) {
                    if (warnings[target]) {
                        delete warnings[target];
                        salvarGruposConfig(configGrupos);
                        await sock.sendMessage(chatId, { text: `✅ Advertências de @${target.split('@')[0]} foram zeradas.`, mentions: [target] });
                    } else {
                        await sock.sendMessage(chatId, { text: `⚠️ @${target.split('@')[0]} não tinha advertências registradas.`, mentions: [target] });
                    }
                } else {
                    configGrupos[chatId].warnings = {};
                    salvarGruposConfig(configGrupos);
                    await sock.sendMessage(chatId, { text: '♻️ Todas as advertências do grupo foram resetadas.' });
                }
            }

        } catch (e) {
            console.error("Erro no sistema de advertências:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao gerenciar as advertências." });
        }
    }
};