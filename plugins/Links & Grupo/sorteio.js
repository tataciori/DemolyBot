// plugins/Grupo/sorteio.js
export default {
  command: ['sorteio', 'raffle', 'giveaway'],
  description: 'Sorteia um prêmio entre os membros do grupo.',
  async run(sock, msg, args, from) {
    const fromJid = msg.key.remoteJid;
    const sender = msg.key.participant || fromJid;
    const isGroup = fromJid.endsWith('@g.us');

    if (!isGroup) {
      return await sock.sendMessage(fromJid, { text: '❌ Este comando só pode ser usado em grupos.' }, { quoted: msg });
    }

    // Mensagem segura
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      '';

    // Pega metadados do grupo
    const metadata = await sock.groupMetadata(fromJid);
    const admins = metadata.participants
      .filter(p => p.admin || p.admin === 'superadmin')
      .map(p => p.id);

    if (!admins.includes(sender)) {
      return await sock.sendMessage(fromJid, { text: '❌ Apenas administradores podem iniciar um sorteio.' }, { quoted: msg });
    }

    if (args.length === 0) {
      return await sock.sendMessage(fromJid, {
        text: `🤔 Qual será o prêmio?\nUse assim: !sorteio 1 mês de Nitro`
      }, { quoted: msg });
    }

    const prize = args.join(' ');

    // Participantes válidos
    const participants = metadata.participants.map(p => p.id);
    const botId = sock.user.id.replace(/:.*$/, '') + '@s.whatsapp.net';
    const validParticipants = participants.filter(p => p !== botId);

    if (validParticipants.length < 1) {
      return await sock.sendMessage(fromJid, { text: 'Não há outros participantes no grupo para sortear.' }, { quoted: msg });
    }

    // Mensagem inicial do sorteio
    await sock.sendMessage(fromJid, {
      text: `🎉 Sorteio iniciado!\n🎁 Prêmio: *${prize}*\n\nSorteando entre *${validParticipants.length}* membros...\n\nBoa sorte! 🍀`,
      mentions: validParticipants
    });

    // Pequena espera para suspense
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Escolhe vencedor aleatório
    const randomIndex = Math.floor(Math.random() * validParticipants.length);
    const winnerId = validParticipants[randomIndex];

    // Anuncia o vencedor
    await sock.sendMessage(fromJid, {
      text: `🎊 E o grande vencedor(a) é... @${winnerId.split('@')[0]}! 🎊\n\n🏆 Parabéns! Você ganhou: *${prize}*\nEntre em contato com o administrador para receber seu prêmio!`,
      mentions: [winnerId]
    });
  }
};
