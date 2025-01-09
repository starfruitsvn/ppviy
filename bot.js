const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Khai báo token bot của bạn
const token = '7890857385:AAEWTo9E2Ke2cqEiePP41Ao7LH9UWblQ6LI'; //TestCg101
//const token = '7760946960:AAEvgsph32I5i-eInIpu6HAZGppySkPo2qc'; //VippyVietQR
// Khởi tạo bot với polling mode
const bot = new TelegramBot(token, { polling: true });
//const bot = new TelegramBot(token, { polling: false });
// Đường dẫn tới file lưu trữ các chat_id của nhóm
const groupsFile = 'groups.json';

// Hàm để lưu chat_id của nhóm vào file
function saveGroupId(chatId) {
    let groups = [];
    // Kiểm tra nếu file groups.json đã tồn tại
    if (fs.existsSync(groupsFile)) {
        groups = JSON.parse(fs.readFileSync(groupsFile));
    }

    // Thêm chat_id nếu chưa có
    if (!groups.includes(chatId)) {
        groups.push(chatId);
        fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2));
    }
}
bot.sendMessage('-1002163949430', 'ta là số 5');
// Hàm xử lý khi bot được thêm vào nhóm
bot.on('new_chat_members', (msg) => {
    msg.new_chat_members.forEach((member) => {
        // Nếu người mới là bot
        if (member.is_bot) {
            const chatId = msg.chat.id;
            saveGroupId(chatId);  // Lưu chat_id của nhóm vào file
            bot.sendMessage(chatId, 'Chào mừng tôi đến với nhóm! 🎉');
        }
    });
});

// Hàm gửi tin nhắn tới tất cả các nhóm đã lưu
bot.onText(/\/send_to_all/, (msg) => {
    const chatId = msg.chat.id;
    if (chatId) {
        let groups = [];
        // Kiểm tra nếu file groups.json đã tồn tại
        if (fs.existsSync(groupsFile)) {
            groups = JSON.parse(fs.readFileSync(groupsFile));
        }

        if (groups.length > 0) {
            groups.forEach((groupId) => {
                bot.sendMessage(groupId, 'Đây là tin nhắn gửi đến tất cả các nhóm!');
            });
        } else {
            bot.sendMessage(chatId, 'Không có nhóm nào được lưu.');
        }
    }
});

// Lệnh để gửi tin nhắn tới một nhóm cụ thể
bot.onText(/\/send_to_group (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const groupId = match[1]; // Lấy chat_id nhóm từ lệnh

    // Gửi tin nhắn đến nhóm cụ thể
    bot.sendMessage(groupId, 'Đây là tin nhắn gửi đến nhóm có chat_id: ' + groupId);
});
