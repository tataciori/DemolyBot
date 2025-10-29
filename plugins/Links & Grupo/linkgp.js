import config from '../../config.js'; 

export default {
    command: ['linkgp', 'link'], 
    description: 'Mostra a foto, informações e o link de convite do grupo.',

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;

        try {
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: '❌ Este comando só funciona em grupos.' }, { quoted: msg });
            }

            // 1. Busca todas as informações ao mesmo tempo
            const [metadata, inviteCode, ppUrl] = await Promise.all([
                sock.groupMetadata(chatId),
                sock.groupInviteCode(chatId),
                sock.profilePictureUrl(chatId, 'image').catch(() => null) // Pega a foto
            ]);

            const groupName = metadata.subject;
            const participantsCount = metadata.participants.length;
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

            // 2. Envia a FOTO DO GRUPO (limpa, sem legenda) se ela existir
            if (ppUrl) {
                await sock.sendMessage(chatId, { 
                    image: { url: ppUrl }
                }, { quoted: msg });
            }

            // 3. Monta o TEXTO FORMATADO (exatamente como nos seus exemplos)
            // Usei emojis genéricos, troque se quiser
            const textoFormatado = `
╔═══════════════════════╗
║                      ║
║  📲 LINK DO GRUPO  ║
║                      ║
╚═══════════════════════╝

🏷️ *Nome:* ${groupName}
👥 *Participantes:* ${participantsCount}
🔗 *Link de Convite:*
${inviteLink}
            `.trim();

            // 4. Envia a MENSAGEM DE TEXTO formatada
            // Ela é enviada como uma nova mensagem, mas respondendo ao comando original
            await sock.sendMessage(chatId, {
                text: textoFormatado
            }, { quoted: msg });

        } catch (e) {
            console.error("Erro no comando !linkgp:", e);
            if (e.message?.includes('forbidden') || e.data === 403) {
                 await sock.sendMessage(chatId, { text: '❌ Falha ao obter as informações. Verifique minhas permissões.' }, { quoted: msg });
            } else {
                 await sock.sendMessage(chatId, { text: '❌ Ocorreu um erro inesperado.' }, { quoted: msg });
            }
        }
    }
};