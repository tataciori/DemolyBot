export default {
  command: ['ping'],
  description: 'Testa se o bot está online.',
  async run(sock, msg, args, from) {
    const fromJid = msg.key.remoteJid;
    await sock.sendMessage(fromJid, { text: '🏓 Pong!' });
  }
};
