// ================== DEMOLYBOT+ MAIN.JS (VERSÃO FINAL - "EDGE") ==================
import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
    // REMOVEMOS o fetchLatestBaileysVersion, ele é a causa do Erro 405
} from '@whiskeysockets/baileys';

import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { fileURLToPath, pathToFileURL } from 'url';
import { Boom } from '@hapi/boom';
import { scheduleJob } from 'node-schedule';
// CORREÇÃO: Voltamos para o qrcode-terminal, é mais rápido que salvar arquivo
import qrcode from 'qrcode-terminal'; 
import config from './config.js';
import { isBotAdmin } from './plugins/utils/checkAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== FUNÇÕES DE CONFIGURAÇÃO (Definidas UMA VEZ AQUI) ==================
// (Todo o seu código de carregar/salvar JSONs permanece igual... está perfeito)
const blacklistFile = path.join(__dirname, 'blacklist.json');
export function loadBlacklist() {
    try {
        if (fs.existsSync(blacklistFile)) return JSON.parse(fs.readFileSync(blacklistFile, 'utf8'));
    } catch (e) { console.error("Erro ao carregar blacklist.json:", e); }
    return [];
}
export function saveBlacklist(list) {
    try {
        fs.writeFileSync(blacklistFile, JSON.stringify(list, null, 2));
    } catch (e) { console.error("Erro ao salvar blacklist.json:", e); }
}
const gruposConfigFile = path.join(__dirname, 'grupos-config.json');
export function carregarGruposConfig() {
    try {
        if (fs.existsSync(gruposConfigFile)) return JSON.parse(fs.readFileSync(gruposConfigFile, 'utf8'));
    } catch (e) { console.error("Erro ao carregar grupos-config.json:", e); }
    return {};
}
export function salvarGruposConfig(config) {
     try {
        fs.writeFileSync(gruposConfigFile, JSON.stringify(config, null, 2));
    } catch (e) { console.error("Erro ao salvar grupos-config.json:", e); }
}
const welcomeConfigFile = path.join(__dirname, 'welcome-config.json');
export function carregarWelcomeConfig() {
    try {
        if (fs.existsSync(welcomeConfigFile)) return JSON.parse(fs.readFileSync(welcomeConfigFile, 'utf8'));
    } catch (e) { console.error("Erro ao carregar welcome-config.json:", e); }
    return {};
}
export function salvarWelcomeConfig(config) {
     try {
        fs.writeFileSync(welcomeConfigFile, JSON.stringify(config, null, 2));
    } catch (e) { console.error("Erro ao salvar welcome-config.json:", e); }
}
// --- Fim Funções Config ---

// ================== CARREGADOR DE PLUGINS ==================
// (O seu carregador de plugins está perfeito e permanece igual)
const commands = new Map();
async function loadPlugins(dir = path.join(__dirname, 'plugins')) {
    if (path.basename(dir) === 'utils') return;
    if (!fs.existsSync(dir)) {
        console.warn(`⚠️ Pasta de plugins não encontrada: ${dir}`);
        return;
    }
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            await loadPlugins(fullPath);
        } else if (stat.isFile() && fullPath.endsWith('.js')) {
            try {
                const mod = await import(pathToFileURL(fullPath).href);
                const plugin = mod.default;
                if (!plugin || typeof plugin.command === 'undefined' || typeof plugin.run !== 'function') {
                    continue;
                }
                const commandList = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
                for (const c of commandList) {
                    const commandName = c.toLowerCase();
                    if (commands.has(commandName)) {
                         console.warn(`⚠️ Comando duplicado: "${commandName}" de ${path.basename(fullPath)} sobrescrevendo anterior.`);
                    }
                    commands.set(commandName, plugin);
                }
                console.log(`✅ Plugin carregado: ${commandList.join(', ')}`);
            } catch (err) {
                console.error(`❌ Erro ao carregar plugin ${path.basename(fullPath)}:`, err);
            }
        }
    }
}
// --- Fim Carregador ---

// ================== INICIAR BOT ==================
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    
    // REMOVEMOS O 'fetchLatestBaileysVersion'. Ele estava causando o Erro 405.
    
    const sock = makeWASocket({
        // REMOVEMOS a linha 'version,'. Ela causava o 'ReferenceError'.
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: [config.botName || 'DemolyBot+', 'Chrome', '1.0.0'],
    });

    // --- CONEXÃO ---
    sock.ev.on('connection.update', (update) => {
        const { qr, connection, lastDisconnect } = update;
        
        // CORREÇÃO: Voltamos a imprimir no terminal. É mais rápido.
        if (qr) {
            console.log('\n📲 QR Code! Escaneie RÁPIDO direto do terminal:');
            // Maximize a janela e diminua o zoom (Ctrl + Roda do Mouse)
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'open') console.log(`✅ Bot conectado como ${sock.user?.name || sock.user?.id}!`);
        else if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;
            console.log(`❌ Conexão fechada (${reason}). Reconectando: ${shouldReconnect}`);
            
            // Mantemos o timer longo de 90s por segurança.
            if (shouldReconnect) setTimeout(() => startBot().catch(console.error), 90000); 
            else console.log('Desconectado permanentemente. Apague auth/.');
        }
    });
    sock.ev.on('creds.update', saveCreds);
    // --- Fim Conexão ---

    // ================== AGENDAMENTOS ==================
    // (Todo o seu código de agendamentos permanece igual... está perfeito)
    console.log("⏰ Configurando agendamentos...");
    const GRUPOS_COM_HORARIO_ESPECIAL = [
        '120363323536694589@g.us', 
        '120363213540794994@g.us'
    ];
    console.log(`⏰ Horário especial (Dom off) para: ${GRUPOS_COM_HORARIO_ESPECIAL.length} grupos.`);
    scheduleJob('0 7 * * 1-6', async () => {
        try {
            console.log("⏰ Exec: Abrir Especiais (Seg-Sáb)."); const cfg = carregarGruposConfig();
            for (const gid of GRUPOS_COM_HORARIO_ESPECIAL) {
                if (cfg[gid]?.abrirFecharAuto) {
                    if (await isBotAdmin(sock, gid)) {
                        await sock.groupSettingUpdate(gid, 'not_announcement');
                        await sock.sendMessage(gid, { text: "🔓 Bom dia, grupo! Que hoje seja leve, produtivo e repleto de sorrisos para todos nós! Grupo aberto." });
                        console.log(`[AutoEsp] ${gid} aberto.`);
                    } else { console.warn(`[AutoEsp] ${gid} não abriu (bot n/ admin).`); }
                }
            }
        } catch (e) { console.error(`[AutoEsp] Erro fatal no agendamento de ABRIR:`, e.message); }
    });
    scheduleJob('0 22 * * 1-5', async () => {
        try {
            console.log("⏰ Exec: Fechar Especiais (Semana)."); const cfg = carregarGruposConfig();
            for (const gid of GRUPOS_COM_HORARIO_ESPECIAL) {
                if (cfg[gid]?.abrirFecharAuto) {
                     if (await isBotAdmin(sock, gid)) {
                          await sock.groupSettingUpdate(gid, 'announcement');
                          await sock.sendMessage(gid, { text: "🔒 Boa noite, pessoal! Hora do descanso. Grupo fechado automaticamente. Voltamos amanhã!" });
                          console.log(`[AutoEsp] ${gid} fechado.`);
                     } else { console.warn(`[AutoEsp] ${gid} não fechou (bot n/ admin).`); }
                }
            }
        } catch (e) { console.error(`[AutoEsp] Erro fatal no agendamento de FECHAR (Semana):`, e.message); }
    });
    scheduleJob('0 22 * * 6', async () => {
        try {
            console.log("⏰ Exec: Fechar Especiais (Sábado)."); const cfg = carregarGruposConfig();
            for (const gid of GRUPOS_COM_HORARIO_ESPECIAL) {
                if (cfg[gid]?.abrirFecharAuto) {
                     if (await isBotAdmin(sock, gid)) {
                          await sock.groupSettingUpdate(gid, 'announcement');
                          await sock.sendMessage(gid, { text: "🔒 Bom descanso e ótimo fim de semana! Grupo fechado automaticamente até segunda-feira." });
                          console.log(`[AutoEsp] ${gid} fechado FDS.`);
                     } else { console.warn(`[AutoEsp] ${gid} não fechou (bot n/ admin).`); }
                }
            }
        } catch (e) { console.error(`[AutoEsp] Erro fatal no agendamento de FECHAR (Sábado):`, e.message); }
    });
    console.log("✅ Agendamentos configurados.");
    // --- Fim Agendamentos ---

    // ================== EVENTO DE ENTRADA E SAÍDA ==================
    // (Seu código de eventos permanece igual... está perfeito)
    sock.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update; const blacklist = loadBlacklist(); const gruposConfig = carregarGruposConfig(); const welcomeConfig = carregarWelcomeConfig(); const configGrupo = gruposConfig[id] || {};
            for (const user of participants) {
                if (action === 'add') {
                    if (configGrupo.antifake === true) { const uNum = user.split('@')[0]; if (!uNum.startsWith('55')) { if (await isBotAdmin(sock, id)) { await sock.sendMessage(id, { text: `🚫 Anti-Fake: @${uNum} removido.`, mentions: [user] }); await sock.groupParticipantsUpdate(id, [user], 'remove'); console.log(`[AntiFake] ${user} removido de ${id}.`); } else { console.warn(`[AntiFake] ${user} detectado ${id}, bot n/ admin.`); } continue; } }
                    if (blacklist.includes(user)) { await sock.sendMessage(id, { text: `🚫 @${user.split('@')[0]} na blacklist.`, mentions: [user] }); if (await isBotAdmin(sock, id)) { await sock.groupParticipantsUpdate(id, [user], 'remove'); } continue; }
                    const cfgWelcome = welcomeConfig[id];
                    if (cfgWelcome?.personalizado === true) {
                        try { const ppUrl = await sock.profilePictureUrl(user, 'image'); await sock.sendMessage(id, { image: { url: ppUrl }, caption: `👋 Bem-vindo(a), @${user.split('@')[0]}!`, mentions: [user] }); } catch {} await new Promise(r => setTimeout(r, 500));
                        let msgWelcome = cfgWelcome.mensagem.replace(/@usuario/gi, `@${user.split('@')[0]}`); let opts = cfgWelcome.imagem ? { image: { url: cfgWelcome.imagem }, caption: msgWelcome, mentions: [user] } : { text: msgWelcome, mentions: [user] }; await sock.sendMessage(id, opts);
                    } else if (configGrupo.mensagem) { await sock.sendMessage(id, { text: configGrupo.mensagem.replace(/@usuario/gi, `@${user.split('@')[0]}`), mentions: [user] }); }
                    if (configGrupo.regrasAuto === true && configGrupo.regras) { await new Promise(r => setTimeout(r, 1000)); await sock.sendMessage(id, { text: `📜 *REGRAS*\nOlá, @${user.split('@')[0]}!\n\n${configGrupo.regras}`, mentions: [user] }); }
                } else if (action === 'remove') {
                    let msgByeConfig = configGrupo.byeMsg; let finalMsg = '';
                    if (msgByeConfig && msgByeConfig.includes('///')) {
                        const options = msgByeConfig.split('///').map(s => s.trim()).filter(s => s);
                        if (options.length > 0) { const randomIndex = Math.floor(Math.random() * options.length); finalMsg = options[randomIndex]; } else { finalMsg = `👋 Adeus, @usuario.`; }
                    } else if (msgByeConfig) { finalMsg = msgByeConfig; } else { finalMsg = `👋 Adeus, @usuario.`; }
                    await sock.sendMessage(id, { text: finalMsg.replace(/@usuario/gi, `@${user.split('@')[0]}`), mentions: [user] });
                }
            }
        } catch (e) { console.error('❌ Erro group-participants.update:', e); }
    });
    // --- Fim Evento Entrada/Saída ---

    // ================== MENSAGENS / COMANDOS ==================
    // (Seu código de comandos permanece igual... está perfeito)
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0]; if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return;
            const chatId = msg.key.remoteJid; const participantId = msg.key.participant;
            if (chatId.endsWith('@g.us') && participantId) { const cfg = carregarGruposConfig(); if (!cfg[chatId]) cfg[chatId] = {}; if (!cfg[chatId].messageCount) cfg[chatId].messageCount = {}; cfg[chatId].messageCount[participantId] = (cfg[chatId].messageCount[participantId] || 0) + 1; salvarGruposConfig(cfg); }
            const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || ''; const prefix = config.prefix || '!'; if (!body.startsWith(prefix)) return;
            const args = body.slice(prefix.length).trim().split(/ +/); const cmdName = args.shift().toLowerCase(); const plugin = commands.get(cmdName);
            if (plugin) { console.log(`📩 Cmd: ${prefix}${cmdName} | Args: ${args.join(' ')} | De: ${chatId} | User: ${participantId || chatId}`); await plugin.run(sock, msg, args); }
        } catch (err) {
            console.error('❌ Erro comando:', err); const errChatId = m.messages[0]?.key?.remoteJid;
            if (errChatId) { try { await sock.sendMessage(errChatId, { text: `😥 Erro! Avise um admin!` }, { quoted: m.messages[0] }); } catch (sendErr) { console.error('Err send err msg:', sendErr.message); } } else { console.error('No chat ID for err msg.'); }
        }
    });
    // --- Fim Processador ---

    console.log("✅ Eventos configurados. Aguardando conexão...");
    return sock;
} // <<< Fim da função startBot()

// --- Função Principal ---
async function main() { console.log("🚀 Iniciando DemolyBot+..."); await loadPlugins(); console.log(`🔌 ${commands.size} comandos carregados.`); await startBot(); }
// --- Fim Função Principal ---

// Inicia o bot
main().catch(err => console.error('❌ Erro fatal na inicialização:', err));