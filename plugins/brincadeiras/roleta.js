import config from '../../config.js';

export default {
    command: ['roleta'],
    description: 'Gira a roleta com resultados divertidos.',
    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            const outcomes = [
                '💀 Perdeu tudo!',
                '💎 Ganhou um prêmio imaginário!',
                '🍀 Sorte grande! Você pode pedir uma música.',
                '😂 Passou vergonha pública!',
                '🔥 Viralizou na internet (pelo motivo errado)!',
                '✨ Virou admin por 5 minutos (só que não)!',
                '🤫 Tem que contar um segredo.',
                '💰 Ganhou 1 milhão de reais (em dinheiro de Monopoly).'
            ];
            
            const pick = outcomes[Math.floor(Math.random() * outcomes.length)];
            
            await sock.sendMessage(chatId, { text: `🎰 *Roleta Demoly*\n\nGirando... e o resultado é:\n\n*${pick}*` });

        } catch (err) {
            console.error('Erro em roleta:', err);
            await sock.sendMessage(chatId, { text: '⚠️ Erro ao girar a roleta.' });
        }
    }
};