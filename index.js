const { WAConnection, MessageType, Mimetype } = require('@adiwajshing/baileys');
const fs = require('fs');
const axios = require('axios');
const moment = require('moment');
const cron = require('node-cron');

const conn = new WAConnection();
let phoneNumber = 'YOUR_PHONE_NUMBER';  // Add your phone number here

// Load authentication information from file or create a new one
async function loadAuth() {
  try {
    if (fs.existsSync('./auth_info.json')) {
      conn.loadAuthInfo('./auth_info.json');
    }
    await conn.connect();
    fs.writeFileSync('./auth_info.json', JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'));
    console.log('Bot is connected successfully!');
  } catch (error) {
    console.log('Error loading auth info:', error);
  }
}

// Send a message to a contact or group
async function sendMessage(to, message) {
  await conn.sendMessage(to, message, MessageType.text);
}

// Auto Status View Feature (Every 10 minutes)
cron.schedule('*/10 * * * *', async () => {
  const status = await conn.getStatus(phoneNumber);
  if (status) {
    console.log('Auto Status View: Checking status...');
    await conn.sendMessage(phoneNumber, 'Status viewed by bot', MessageType.text);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Auto React Feature
async function autoReact(message) {
  const isGroup = message.key.remoteJid.endsWith('@g.us');
  if (isGroup) {
    console.log(`Auto React: Reacting to a group message from ${message.key.remoteJid}`);
    const reactions = ['😊', '😂', '👍']; // Add more emojis
    await conn.sendMessage(message.key.remoteJid, { react: { text: reactions[Math.floor(Math.random() * reactions.length)], key: message.key } });
  }
}

// Listen for messages
conn.on('chat-update', async (chatUpdate) => {
  if (!chatUpdate.hasNewMessage) return;
  const message = chatUpdate.messages.all()[0];
  const from = message.key.remoteJid;

  console.log(`New message from ${from}:`, message);

  // Auto React to incoming messages
  await autoReact(message);

  // Command: !status
  if (message.message.conversation === '!status') {
    await sendMessage(from, 'Bot is online! How can I help you?');
  }

  // Command: !autoreact
  if (message.message.conversation === '!autoreact') {
    await sendMessage(from, 'Auto React is now enabled!');
  }

  // Command: !viewstatus
  if (message.message.conversation === '!viewstatus') {
    const status = await conn.getStatus(phoneNumber);
    await sendMessage(from, `Current status: ${status.status || 'No status set'}`);
  }
});

// Initialize the connection and load the bot
loadAuth();

// Listen for incoming connection
conn.on('open', () => {
  console.log('Bot is connected and ready to use!');
});
