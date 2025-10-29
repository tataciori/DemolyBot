export default {
  command: ['promover', 'rebaixar', 'padmin', 'demote'],
  description: 'Promove ou rebaixa um membro do grupo.',
  
  async run(sock, msg, args, from) {
    const fromJid = msg.key.remoteJid;
    const sender = msg.key.participant || fromJid; 
    const comando = args.shift()?.toLowerCase() || msg.message.conversation?.slice(1).split(/\s+/)[0].toLowerCase();

    if (!fromJid.endsWith('@g.us')) return sock.sendMessage(fromJid, { text: '❌ Comando só para grupos.' });

    // Ação baseada no comando usado
    const action = (comando === 'promover' || comando === 'padmin') ? 'promote' : 
                 (comando === 'rebaixar' || comando === 'demote') ? 'demote' : null;

    if (!action) return; // Comando inválido

    // --- Checagem de Administração (Para quem executa) ---
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
      return sock.sendMessage(fromJid, { text: `❌ Marque alguém para ${action === 'promote' ? 'promover' : 'rebaixar'}.` });
    }
    
    // O bot precisa ser um superadmin ou criador para dar/tirar admin de outros admins.
    const botId = sock.user.id;
    if (!admins.includes(botId)) {
        return sock.sendMessage(fromJid, { text: '⚠️ O bot precisa ser administrador para executar esta ação.' });
    }

    // --- Execução ---
    try {
        await sock.groupParticipantsUpdate(fromJid, mentions, action);
        const successText = action === 'promote' ? 'promovido(s) a administrador(es)' : 'rebaixado(s) de administrador(es)';
        return sock.sendMessage(fromJid, { 
          text: `✅ Usuário(s) ${successText} com sucesso.`, 
          mentions 
        });
    } catch (error) {
        console.error('Erro ao promover/rebaixar:', error);
        return sock.sendMessage(fromJid, { text: '🚨 Não foi possível realizar a ação. Verifique se o bot tem permissão de superadministrador ou se o alvo já não tem o status desejado.' });
    }
  }
};