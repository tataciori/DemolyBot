import config from '../../config.js';

export default {
    command: ['simounao', 'sn'],
    description: 'Responde sim ou não de forma aleatória.',
    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            const opts = [
                '✅ Sim, com certeza!',
                '❌ Definitivamente não.',
                '🤔 Hmm, talvez...',
                '💭 Melhor não te contar agora...',
                '👍 Com certeza, vai fundo!',
                '⛔️ Eu não faria isso se fosse você.',
                '🤷‍♂️ Sei lá, se vira.',
                '✨ Os astros dizem que sim!'
            ];
            
            const pick = opts[Math.floor(Math.random() * opts.length)];

            await sock.sendMessage(chatId, { text: `🎱 *Oráculo Demoly*\n\nSua resposta é: *${pick}*` });

        } catch (err) {
            console.error('Erro em simounao:', err);
            await sock.sendMessage(chatId, { text: '⚠️ Erro ao consultar o oráculo.' });
        }
    }
};