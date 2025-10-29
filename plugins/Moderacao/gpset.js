import { isBotAdmin } from '../utils/checkAdmin.js'; // Importa nossa ferramenta!

export default {
    command: ['fechargp', 'abrirgp', 'mutargp', 'desmutargp'],
    description: 'Fecha ou abre o grupo para que apenas admins possam enviar mensagens.',

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            const senderId = msg.key.participant;
            const commandUsed = (msg.message?.conversation || msg.message?.extendedTextMessage?.text)?.split(' ')[0].slice(1).toLowerCase() || "";

            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: '❌ Comando apenas para grupos.' });
            }

            // CORRIGIDO: 'fechargp' ativa o modo 'anúncio', 'abrirgp' desativa.
            const setting = (commandUsed === 'fechargp' || commandUsed === 'mutargp') ? 'announcement' : 
                          (commandUsed === 'abrirgp' || commandUsed === 'desmutargp') ? 'not_announcement' : null;
            
            if (!setting) return; // Se o comando não for um dos esperados, não faz nada.

            // --- Checagem de Admin (do Usuário) ---
            const metadata = await sock.groupMetadata(chatId);
            const senderIsAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
            
            if (!senderIsAdmin) {
                return await sock.sendMessage(chatId, { text: '🚫 Apenas administradores podem usar este comando.' });
            }
            
            // --- Checagem de Admin (do BOT) - USANDO NOSSA FERRAMENTA CORRETA ---
            const botIsAdmin = await isBotAdmin(sock, chatId);
            if (!botIsAdmin) {
                return await sock.sendMessage(chatId, { text: '⚠️ Eu preciso ser *administrador* para modificar as configurações do grupo.' });
            }

            // --- Execução ---
            await sock.groupSettingUpdate(chatId, setting);
            
            const status = setting === 'announcement' ? 'FECHADO (Apenas Admins)' : 'ABERTO (Todos)';
            await sock.sendMessage(chatId, { text: `✅ Grupo configurado como: *${status}*.` });

        } catch (error) {
            console.error('Erro ao configurar o grupo:', error);
            await sock.sendMessage(chatId, { text: '🚨 Ocorreu um erro ao tentar mudar a configuração do grupo.' });
        }
    }
};