import config from '../../config.js';

export default {
    command: ['casaldodia', 'casal', 'ship'],
    description: 'Sorteia um casal aleatório entre os membros do grupo.',

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            // Verifica se o comando foi enviado em um grupo
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: 'Este comando só funciona em grupos.' });
            }

            const meta = await sock.groupMetadata(chatId);
            let participants = meta.participants.map(p => p.id);

            // Tenta remover o próprio bot da lista de sorteio
            const botId = sock.user?.id.split(':')[0] + '@s.whatsapp.net';
            if (botId) {
                participants = participants.filter(p => p !== botId);
            }

            if (participants.length < 2) {
                return await sock.sendMessage(chatId, { text: '❌ Não há participantes suficientes para sortear um casal.' });
            }

            // Escolhe duas pessoas diferentes aleatoriamente
            const i1 = Math.floor(Math.random() * participants.length);
            let i2;
            do {
                i2 = Math.floor(Math.random() * participants.length);
            } while (i2 === i1);

            const p1 = participants[i1];
            const p2 = participants[i2];

            const text = `💞 *CASAL DO DIA* 💞\n\n❤️ @${p1.split('@')[0]} + 💖 @${p2.split('@')[0]}\n\nQue o casal tenha sorte hoje! ${config.emojiBot || ''}`;
            
            await sock.sendMessage(chatId, { text, mentions: [p1, p2] });

        } catch (err) {
            console.error('Erro em casaldodia:', err);
            await sock.sendMessage(chatId, { text: '⚠️ Ocorreu um erro ao executar o comando.' });
        }
    }
};