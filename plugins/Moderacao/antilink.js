import { carregarGruposConfig, salvarGruposConfig } from '../../main.js'; 

export default {
    command: ['antilink'],
    description: 'Liga ou desliga a proteção contra links de convite do WhatsApp.',
    
    async run(sock, msg, args, from) {
        const fromJid = msg.key.remoteJid;
        const sender = msg.key.participant || fromJid;
        const action = args[0]?.toLowerCase(); // 'on-delete', 'on-kick', 'off'

        if (!fromJid.endsWith('@g.us')) return sock.sendMessage(fromJid, { text: '❌ Comando só para grupos.' });

        // --- Checagem de Administração ---
        const metadata = await sock.groupMetadata(fromJid);
        const admins = metadata.participants
            .filter(p => p.admin || p.admin === 'superadmin')
            .map(p => p.id);
        
        if (!admins.includes(sender)) {
            return sock.sendMessage(fromJid, { text: '🚫 Apenas administradores podem usar este comando.' });
        }
        
        const configGrupos = carregarGruposConfig();
        const configGrupo = configGrupos[fromJid] || {};

        if (action === 'on-delete' || action === 'delete') {
            configGrupo.antilink = 'delete'; // Deleta a mensagem
        } else if (action === 'on-kick' || action === 'kick') {
            configGrupo.antilink = 'remove'; // Remove o usuário
        } else if (action === 'off' || action === 'desligar') {
            configGrupo.antilink = false;
        } else {
            const currentStatus = configGrupo.antilink ? 
                `ATIVADO (${configGrupo.antilink === 'delete' ? 'Deletar' : 'Remover'})` : 'DESATIVADO';
            return sock.sendMessage(fromJid, { 
                text: `Status Anti-Link: ${currentStatus}\n\nComandos:\n!antilink on-delete: Deleta o link.\n!antilink on-kick: Remove o usuário.\n!antilink desligar: Desativa.` 
            });
        }
        
        configGrupos[fromJid] = configGrupo;
        salvarGruposConfig(configGrupos);

        const newStatus = configGrupo.antilink ? 
            `ATIVADO (${configGrupo.antilink === 'delete' ? 'Deletar' : 'Remover'})` : 'DESATIVADO';
            
        return sock.sendMessage(fromJid, { text: `✅ Anti-Link configurado: *${newStatus}*.` });
    }
};