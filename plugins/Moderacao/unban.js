export default {
  command: ['unban', 'perdoar'],
  description: 'Remove um usuário da lista negra, permitindo sua reentrada.',
  
  async run(sock, msg, args, from) {
    // Funções de blacklist injetadas pelo main.js
    const { loadBlacklist, saveBlacklist } = this;
    
    const fromJid = msg.key.remoteJid;
    const sender = msg.key.participant || fromJid; 

    if (!fromJid.endsWith('@g.us')) {
      return sock.sendMessage(fromJid, { text: '❌ Comando só para grupos.' });
    }

    // --- Checagem de Administração ---
    const metadata = await sock.groupMetadata(fromJid);
    const admins = metadata.participants
      .filter(p => p.admin || p.admin === 'superadmin')
      .map(p => p.id);
    
    if (!admins.includes(sender)) {
      return sock.sendMessage(fromJid, { text: '🚫 Apenas administradores podem usar este comando.' });
    }

    // --- Identificação do Alvo ---
    const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentions.length === 0) {
      return sock.sendMessage(fromJid, { text: '❌ Marque alguém para remover da lista negra.' });
    }

    // --- Lógica da Lista Negra (Remoção) ---
    try {
        const blacklist = loadBlacklist();
        let removedCount = 0;

        const updatedBlacklist = blacklist.filter(jid => {
          if (mentions.includes(jid)) {
            removedCount++;
            return false; // Remove da lista
          }
          return true; // Mantém na lista
        });

        if (removedCount > 0) {
          saveBlacklist(updatedBlacklist);
          return sock.sendMessage(fromJid, { 
            text: `✅ ${removedCount} usuário(s) removido(s) da lista negra. Eles podem ser adicionados ao grupo novamente.`, 
            mentions 
          });
        } else {
          return sock.sendMessage(fromJid, { text: '⚠️ Nenhum dos usuários marcados estava na lista negra.' });
        }
    
    } catch (error) {
        console.error('❌ Erro ao manipular a blacklist no comando unban:', error);
        return sock.sendMessage(fromJid, { text: '🚨 Ocorreu um erro ao tentar remover o usuário da lista negra.' });
    }
  }
};