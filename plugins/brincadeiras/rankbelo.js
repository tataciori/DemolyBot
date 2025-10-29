import config from '../../config.js';

export default {
    command: ['rankbelo', 'rankbonito', 'topbelo'],
    description: 'Top 5 mais belos do grupo.',
    
    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: 'Este comando só funciona em grupos.' });
            }

            const metadata = await sock.groupMetadata(chatId);
            const participants = metadata.participants;

            // Embaralha a lista de participantes
            const shuffled = participants.sort(() => Math.random() - 0.5);
            
            // Pega os 5 primeiros (ou menos, se o grupo for menor)
            const selected = shuffled.slice(0, Math.min(5, shuffled.length));

            // Cria a lista de texto já com as menções
            const lines = selected.map((p, i) => {
                return `#${i + 1} 💅 @${p.id.split('@')[0]}`;
            });

            // Cria o array de menções para o Baileys
            const mentions = selected.map(p => p.id);
            
            const now = new Date();
            const hora = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });

            const texto = `💎 *RANK - MAIS BELOS DO GRUPO* 💎\n\n${lines.join('\n')}\n\n👤 Solicitado por: @${msg.key.participant.split('@')[0]}\n⏰ ${hora}`;
            
            // Adiciona o solicitante ao array de menções
            mentions.push(msg.key.participant);

            await sock.sendMessage(chatId, { text: texto, mentions });

        } catch (e) {
            console.error('Erro no rankbelo:', e);
            await sock.sendMessage(chatId, { text: config.MensagemErro || '⚠️ Erro ao executar o comando.' });
        }
    }
}