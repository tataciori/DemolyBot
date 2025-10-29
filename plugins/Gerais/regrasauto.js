import { carregarGruposConfig, salvarGruposConfig } from '../../main.js';

export default {
    command: ["regrasauto"],
    description: "Ativa ou desativa o envio automático de regras para novos membros.",
    
    async run(sock, msg, args) {
        const remoteJid = msg.key.remoteJid;

        if (!remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(remoteJid, { text: "Este comando só pode ser usado em grupos." }, { quoted: msg });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const groupMetadata = await sock.groupMetadata(remoteJid);
        const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
        
        if (!admins.includes(senderId)) {
            await sock.sendMessage(remoteJid, { text: "❌ Apenas administradores podem usar este comando." }, { quoted: msg });
            return;
        }

        const option = args[0]?.toLowerCase();
        const gruposConfig = carregarGruposConfig();

        if (!gruposConfig[remoteJid]) {
            gruposConfig[remoteJid] = {};
        }

        if (option === 'on' || option === 'ativar') {
            gruposConfig[remoteJid].regrasAuto = true;
            salvarGruposConfig(gruposConfig);
            await sock.sendMessage(remoteJid, { text: "✅ Sistema de regras automáticas ATIVADO.\nAs regras serão enviadas para cada novo membro." }, { quoted: msg });
        } else if (option === 'off' || option === 'desativar') {
            gruposConfig[remoteJid].regrasAuto = false;
            salvarGruposConfig(gruposConfig);
            await sock.sendMessage(remoteJid, { text: "❌ Sistema de regras automáticas DESATIVADO." }, { quoted: msg });
        } else {
            const status = gruposConfig[remoteJid]?.regrasAuto ? 'Ativado' : 'Desativado';
            await sock.sendMessage(remoteJid, { text: `ℹ️ O envio automático de regras está *${status}*.\n\nUse *!regrasauto on* para ativar ou *!regrasauto off* para desativar.` }, { quoted: msg });
        }
    }
};