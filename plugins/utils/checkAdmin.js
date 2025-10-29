// /plugins/utils/checkAdmin.js
import { areJidsSameUser } from '@whiskeysockets/baileys'; // Mantemos para consistência

export async function isBotAdmin(sock, chatId) {
    try {
        // Tenta fazer uma alteração mínima que exige admin (mudar nome para o mesmo nome)
        const metadata = await sock.groupMetadata(chatId);
        if (!metadata) return false; // Se não conseguir metadados, não é admin
        const currentSubject = metadata.subject;
        
        await sock.groupUpdateSubject(chatId, currentSubject); 
        
        // Se a linha acima NÃO deu erro, significa que o bot TEM permissão!
        return true; 

    } catch (e) {
        // Se deu erro, verificamos se foi por falta de permissão
        const errorMessage = e.message?.toLowerCase() || "";
        const statusCode = e.output?.statusCode || e.data;

        if (errorMessage.includes('forbidden') || statusCode === 403) {
             // Erro 403 confirma que NÃO é admin
             return false;
        } else {
            // Outro erro inesperado (rede, etc.), loga mas retorna false por segurança
            console.error("Erro inesperado ao verificar admin:", e);
            return false;
        }
    }
}