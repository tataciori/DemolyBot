// /plugins/Gerais/id.js

export default {
  command: ["id"],
  description: "Mostra o ID do grupo atual.",
  
  async run(sock, msg) {
    // Responde à mensagem com o ID do chat/grupo
    await sock.sendMessage(msg.key.remoteJid, { text: `O ID deste grupo é:\n${msg.key.remoteJid}` });
  },
};