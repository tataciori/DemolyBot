import config from '../../config.js';

export default {
    command: ['ranknerd', 'topnerd'],
    description: 'Top 5 mais nerds do grupo.',
    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            if (!chatId.endsWith('@g.us')) return await sock.sendMessage(chatId, { text: 'Este comando só funciona em grupos.' });
            const metadata = await sock.groupMetadata(chatId);
            const participants = metadata.participants.filter(p => p.id !== sock.user.id.split(':')[0] + '@s.whatsapp.net');
            if (participants.length < 5) return await sock.sendMessage(chatId, { text: '❌ Precisa de pelo menos 5 membros no grupo para o rank.' });

            const selected = participants.sort(() => Math.random() - 0.5).slice(0, 5);
            const lines = selected.map((p, i) => `#${i + 1} 🤓 @${p.id.split('@')[0]}`);
            const mentions = selected.map(p => p.id);
            
            const texto = `🤓 *RANK - MAIS NERDS DO GRUPO* 🤓\n\n${lines.join('\n')}`;
            await sock.sendMessage(chatId, { text: texto, mentions });
        } catch (e) {
            console.error('Erro no ranknerd:', e);
            await sock.sendMessage(chatId, { text: config.MensagemErro || '⚠️ Erro ao executar o comando.' });
        }
    }
}