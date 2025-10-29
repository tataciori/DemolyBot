import config from '../../config.js';

export default {
  command: ['duelo', 'batalha', 'fight'],
  description: 'Sorteia dois membros do grupo para um duelo e anuncia o vencedor.',
  async run(sock, msg, args, from) {
    const chatId = from || msg?.key?.remoteJid;
    try {
      const meta = await sock.groupMetadata(chatId);
      let participants = meta.participants.map(p => p.id);

      const botId = sock.user?.id ? `${sock.user.id.split(':')[0]}@s.whatsapp.net` : null;
      if (botId) participants = participants.filter(p => p !== botId);

      if (participants.length < 2) {
        return await sock.sendMessage(chatId, { text: '❌ Precisa de ao menos 2 participantes no grupo para duelar.' });
      }

      // escolhe dois lutadores distintos
      const i1 = Math.floor(Math.random() * participants.length);
      let i2;
      do { i2 = Math.floor(Math.random() * participants.length); } while (i2 === i1);

      const a = participants[i1];
      const b = participants[i2];

      const outcomes = [
        `💥 @${a.split('@')[0]} acertou um golpe perfeito e venceu!`,
        `🔥 @${b.split('@')[0]} mostrou garra e levou a vitória!`,
        `⚔️ Empate épico entre @${a.split('@')[0]} e @${b.split('@')[0]}!`,
        `💣 Ambos fugiram do duelo... que covardia! 😆`
      ];
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];

      await sock.sendMessage(chatId, {
        text: `🥊 *DUELO ALEATÓRIO*\n\n👊 @${a.split('@')[0]} VS 🥋 @${b.split('@')[0]}\n\n${result}`,
        mentions: [a, b]
      });
    } catch (err) {
      console.error('Erro em duelo:', err);
      await sock.sendMessage(chatId, { text: '⚠️ Ocorreu um erro ao processar o duelo.' });
    }
  }
};
