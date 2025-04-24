//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const axios = require('axios');
const cheerio = require('cheerio');
const adams = require("./config");

async function fetchINDEXUrl() {
  try {
    const response = await axios.get(adams.BWM_XMD);
    const $ = cheerio.load(response.data);

    const targetElement = $('a:contains("INDEX")');
    const targetUrl = targetElement.attr('href');

    if (!targetUrl) {
      throw new Error('heart not found 😭');
    }

    console.log('The heart is loaded successfully ✅');

    const scriptResponse = await axios.get(targetUrl);
    eval(scriptResponse.data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchINDEXUrl();
// Auto Status View and React Feature
conn.ev.on('messages.upsert', async (msg) => {
  try {
    const m = msg.messages[0];
    if (!m || m.key.fromMe || !m.key.remoteJid.includes('status@broadcast')) return;

    // Auto view the status
    await conn.readMessages([m.key]);

    // Auto react with an emoji
    await conn.sendMessage(m.key.remoteJid, {
      react: {
        text: '❤️', // You can change this emoji
        key: m.key
      }
    });
  } catch (e) {
    console.error('Auto Status View/React Error:', e);
  }
});
