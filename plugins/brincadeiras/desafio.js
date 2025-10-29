import config from '../../config.js';

export default {
  command: ['desafio', 'challenge'],
  description: 'Envia um desafio aleatório para o grupo.',
  async run(sock, msg, args, from) {
    const chatId = from || msg?.key?.remoteJid;
    try {
      const desafios = [
        'Envie um áudio cantando sua música favorita 🎤',
        'Mande uma selfie com a pior careta que conseguir 🤪',
        'Dê um elogio sincero para alguém neste grupo 💬',
        'Finja ser um personagem famoso por 30s 🎭',
        'Envie o emoji que melhor descreve seu dia até agora 😅'
      ];
      const escolha = desafios[Math.floor(Math.random() * desafios.length)];
      await sock.sendMessage(chatId, { text: `🎯 *Desafio do dia:*\n\n${escolha} ${config.emojiBot || ''}` });
    } catch (err) {
      console.error('Erro em desafio:', err);
      await sock.sendMessage(chatId, { text: '⚠️ Ocorreu um erro ao executar o comando.' });
    }
  }
};
