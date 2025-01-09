const axios = require('axios');

// URL Webhook của bạn
const webhookUrl = 'https://discord.com/api/webhooks/1319475809186091069/FDm_xREjQp2PPXFVx1CHiS65a8ow8h3fdgoUV9TTeqJFuNdMUcsiCwSsyBv4C4HOvx1N';

// Hàm gửi tin nhắn qua webhook
async function sendMessage(message) {
  try {
    const response = await axios.post(webhookUrl, {
      content: message,  // Tin nhắn muốn gửi
    });

    console.log('Tin nhắn đã được gửi thành công!', response.data);
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn:', error);
  }
}

// Gửi một tin nhắn thử
sendMessage('Xin chào, đây là tin nhắn từ bot qua Webhook 1');
