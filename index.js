// Import the required modules
const express = require('express');
const admin = require('firebase-admin');
const Cipher = require('./cipher');
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');
const { checkDeposit } = require('./lib/vippy_db.js');
// Initialize Firebase Admin SDK
const serviceAccount = require('./vippy-pro-firebase-adminsdk-gwjfa-412a251d28.json'); // Đường dẫn đến tệp khóa dịch vụ của bạn
var contractList = [];

var DELETE_FEE_RATION = 0.05;
var SIGN_FEE_RATION = 0.10;
var AGREE_FEE_RATION = 0.10;
var REFUND_FEE_RATION = 0.10;
var SPLIT_FEE_RATION = 0.20;
var OVERTIME_FEE_RATION = 0.20;
var MIN_FEE = 2000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "vippy-pro.firebaseapp.com" // URL của dự án Firebase của bạn
});

const db = admin.firestore();
const app = express();



// Thay thế 'YOUR_BOT_TOKEN' bằng token của bot của bạn
const token = '';
const channelId = '1319475618840182858'; // Thay thế 'YOUR_CHANNEL_ID' bằng ID của kênh

// Tạo client với các intents cần thiết
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,  // Cấp quyền để bot đọc nội dung tin nhắn
  ]
});

// Khi bot đã sẵn sàng
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

function testString(_str){
  var inputString = _str;
  console.log("inputString = "+inputString);
  
  const regex = /\+([\d,]+) VND/;
  // Áp dụng regex vào chuỗi đầu vào
  const match = inputString.match(regex);

  // Kiểm tra và lấy kết quả
  if (match) {
    var money = match[1]; // Kết quả là phần giá trị số (sau dấu "+" và trước " VND")
    money = money.replace(",","");
    var _depositValue = parseInt(money);
    console.log("money = "+money); // Kết quả: 5,000

    // Sử dụng regex để tìm chuỗi bắt đầu bằng "VIY" và kết thúc bằng "ZK", loại bỏ "VIY" và "ZK"
    // /const str = "Example VIYabc123ZK more text VIYtestZK end";
    const regexCode = /(?<=VIY)(.*?)(?=ZK)/g;
    const matchesCode = [...inputString.matchAll(regexCode)];

    if (matchesCode.length > 0){
      console.log(matchesCode[0]);
      const code = "VIY"+matchesCode[0][0]+"ZK";
      console.log("code = "+code); // Kết quả: 123456
      //Tìm giao dịch với money và code trong db; 
      //nếu overtime 15 phút -> bỏ qua
      //nếu chưa + tiền thì +
      checkDeposit(admin,db,code,_depositValue)
      .then(result => {
          console.log('Deposit thỏa mãn điều kiện:', result);
          
      })
      .catch(error => {
          console.error('Có lỗi xảy ra:', error);
      });
    }
    /*
    matchesCode.forEach(match => {
      console.log(matchesCode[0]);  // In ra phần chuỗi con khớp với regex
    });
    */
  } else {
    console.log("Không tìm thấy kết quả khớp.");
  }
}
//testString("+5,000 VND | TK: MBBank - 0354745688 | 31/12/2024 10:29:45 | FT24366220020461 | ND: VIY0SMW28ZK FT24366553925017   Ma giao dich  Trace235732 Trace 235732");
// Lắng nghe sự kiện mới có tin nhắn
client.on('messageCreate', message => {
  // Kiểm tra nếu tin nhắn không phải do bot gửi
  if (message.author.bot) {
	  console.log("bot send msg");
	  console.log(`${message.author.tag}: ${message.content}`);
    if ( message.author.tag == "VietQR#0000"){
      // Sử dụng regex để tìm chuỗi bắt đầu bằng "+" và kết thúc bằng " VND", loại bỏ dấu "+" và " VND"
      const regex = /\+([\d,]+) VND/;
      var inputString = message.content;
      console.log("inputString = "+inputString);
      // Áp dụng regex vào chuỗi đầu vào
      const match = inputString.match(regex);

      // Kiểm tra và lấy kết quả
      if (match) {
        var money = match[1]; // Kết quả là phần giá trị số (sau dấu "+" và trước " VND")
        money = money.replace(",","");
        console.log("money = "+money); // Kết quả: 5,000

        var _depositValue = parseInt(money);
      console.log("money = "+money); // Kết quả: 5,000

        // Sử dụng regex để tìm chuỗi bắt đầu bằng "VIY" và kết thúc bằng "ZK", loại bỏ "VIY" và "ZK"
        // /const str = "Example VIYabc123ZK more text VIYtestZK end";
        const regexCode = /(?<=VIY)(.*?)(?=ZK)/g;
        const matchesCode = [...inputString.matchAll(regexCode)];

        if (regexCode.length > 0){
          const code = "VIY"+regexCode[0]+"ZK";
          console.log("code = "+code); // Kết quả: 123456
          //Tìm giao dịch với money và code trong db; 
          //nếu overtime 15 phút -> bỏ qua
          //nếu chưa + tiền thì +
          checkDeposit(admin,db,code,_depositValue)
          .then(result => {
              console.log('Deposit thỏa mãn điều kiện:', result);
              
          })
          .catch(error => {
              console.error('Có lỗi xảy ra:', error);
          });
        }
        regexCode.forEach(match => {
          console.log(regexCode[0]);  // In ra phần chuỗi con khớp với regex
        });
      } else {
        console.log("Không tìm thấy kết quả khớp.");
      }
    }
	  return;
  }
  else{
  
	  // In ra nội dung tin nhắn và tên người gửi
	  console.log(`${message.author.tag}: ${message.content}`);
  }
});
// Hàm lấy danh sách các tin nhắn từ kênh
async function fetchMessages() {
  try {
    // Lấy kênh theo ID
    const channel = await client.channels.fetch(channelId);

    // Kiểm tra xem kênh có phải là một kênh văn bản hay không
    if (!channel.isTextBased()) {
      console.log('Kênh không phải là kênh văn bản');
      return;
    }

    // Lấy các tin nhắn gần nhất trong kênh (ví dụ, lấy 10 tin nhắn gần nhất)
    const messages = await channel.messages.fetch({ limit: 10 });

    console.log('Danh sách tin nhắn trong kênh:');
    messages.forEach(msg => {
      //console.log(`- ${msg.author.tag}: ${msg.content}`);
	   console.log('--- Thông tin tin nhắn ---');
		  console.log('Nội dung tin nhắn: ', msg.content); // In nội dung tin nhắn
		  console.log('Tác giả: ', msg.author.tag); // Tên tác giả
		  console.log('ID tin nhắn: ', msg.id); // ID của tin nhắn
		  console.log('Thời gian gửi: ', msg.createdAt); // Thời gian gửi tin nhắn
		  console.log('Có đính kèm file không?: ', msg.attachments.size > 0 ? 'Có' : 'Không');
		  console.log('Loại tin nhắn: ', msg.type); // Loại tin nhắn (ví dụ: text, reply, etc)
		  console.log('Gửi bởi bot? ', msg.author.bot ? 'Có' : 'Không'); // Kiểm tra xem tin nhắn có phải từ bot không
		  console.log('ID channel: ', msg.channel.id); // ID của kênh gửi tin nhắn
		  console.log('--- Kết thúc ---\n');
    });
  } catch (error) {
    console.error('Lỗi khi lấy tin nhắn:', error);
  }
}

// Đăng nhập bot và thực hiện lấy tin nhắn
client.login(token).then(() => {
  // Gọi hàm lấy tin nhắn sau khi bot đã đăng nhập thành công
  //fetchMessages();
});


// Hàm để load tất cả các hợp đồng không có status là "Finish"
async function loadContracts() {
    try {
        const snapshot = await db.collection('Contracts')
        //.where('Status', '!=', 'Finished').get();
        .where('Status', 'not-in', ['Finished', 'Split','Refund','Ovt_Finished', 'Ovt_Split','Ovt_Refund','Send','Request']).get();
        const contracts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("loadContracts contracts.length = "+contracts.length);
        for (const contract of contracts) {
            if (contract.Status == "Finished" || contract.Status == "Split" || contract.Status == "Refund")
              continue;
            // Kiểm tra xem contract đã có trong contractList chưa
            const existingContractIndex = contractList.findIndex(c => c.id === contract.id);

            if (existingContractIndex !== -1) {
                // Nếu đã có, cập nhật _contract
                contractList[existingContractIndex] = contract;
                console.log(`loadContracts Cập nhật hợp đồng: ID: ${contract.id}`);
            } else {
                // Nếu chưa có, thêm mới
                contractList.push(contract);
                console.log(`loadContracts Thêm hợp đồng mới: ID: ${contract.id}`);
            }
            /*
            // So sánh thời gian hiện tại với LastDate
            const now = new Date();
            const LastDate = contract.LastDate ? new Date(contract.LastDate) : null;
            
            if (LastDate && LastDate < now) {
                console.log("older");
            }
            */
        }
        //console.log("loadContracts:", contracts); //mautran
    } catch (error) {
        console.error("loadContracts error:", error);
    }
}

// Lắng nghe sự thay đổi trong collection
function watchContracts() {
    const query = db.collection('Contracts')
    //.where('Status', '!=', 'Finish');
    .where('Status', 'not-in', ['Finished', 'Split','Refund','Ovt_Finished', 'Ovt_Split','Ovt_Refund','Send','Request']);

    query.onSnapshot((snapshot) => {
        const contracts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("watchContracts contracts.length = "+contracts.length);
        for (const contract of contracts) {
            if (contract.Status == "Finished" || contract.Status == "Split" || contract.Status == "Refund")
              continue;
            // Kiểm tra xem contract đã có trong contractList chưa
            const existingContractIndex = contractList.findIndex(c => c.id === contract.id);

            if (existingContractIndex !== -1) {
                // Nếu đã có, cập nhật _contract
                contractList[existingContractIndex] = contract;
                console.log(`watchContracts Cập nhật hợp đồng: ID: ${contract.id}`);
            } else {
                // Nếu chưa có, thêm mới
                contractList.push(contract);
                console.log(`watchContracts Thêm hợp đồng mới: ID: ${contract.id}`);
            }
            /*
            // So sánh thời gian hiện tại với LastDate
            const now = new Date();
            const LastDate = contract.LastDate ? new Date(contract.LastDate) : null;
            
            if (LastDate && LastDate < now) {
                console.log("older");
            }
            */
        }
        //console.log("watchContracts:", contracts); //mautran
    }, (error) => {
        console.error("watchContracts error:", error);
    });
}

// Lấy thời điểm hiện tại
const currentTime = new Date();
var nearestTime = new Date(currentTime.setFullYear(currentTime.getFullYear() + 1));

// Khởi động ứng dụng
//loadContracts();
watchContracts();

// Hàm để kiểm tra thời gian
function checkTime() {
    console.log("checkTime .... ");
    // Đọc file date_change.json
    fs.readFile('date_change.json', 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading file:', err);
          return;
      }

      try {
          // Chuyển đổi nội dung file thành đối tượng JavaScript
          const dateChange = JSON.parse(data);

          // Lấy thời gian hiện tại
          let now = new Date();
          /*
          // Cộng các giá trị vào thời gian hiện tại
          now.setDate(now.getDate() + dateChange.dd);
          now.setHours(now.getHours() + dateChange.hh);
          now.setMinutes(now.getMinutes() + dateChange.mm);
          now.setSeconds(now.getSeconds() + dateChange.ss);
          */
          if (now - nearestTime <= 0){
            var paid_days = dateChange.paid_dd;
            var reject_days = dateChange.reject_dd;
            var claim_days = dateChange.claim_dd;
  
            console.log('New Date:', now);
  
            const hours = now.getHours();
            const minutes = now.getMinutes();
  
            for (let i = contractList.length - 1; i >= 0; i--) {
              const contract = contractList[i];
              console.log(`checkTime ID: ${contract.id}, Trạng thái: ${contract.Status} ----------- `);
              /*
              if (contract.Status == "Send" || contract.Status == "Request" || contract.Status == "Open"){
                const createDateTimestamp = contract.CreatedDate;
                const createContractDate = createDateTimestamp.toDate();
                console.log("checkTime createContractDate:",createContractDate);

              }
              */
              // Thêm bất kỳ trường nào khác bạn muốn xử lý ở đây
              //const contractDate = new Date(contract.LastDate);
              // Giả sử trường CreatedDate là một Timestamp
              const lastDateTimestamp = contract.LastDate;
              const contractDate = lastDateTimestamp.toDate();
              console.log("checkTime contractDate:",contractDate);
              if (contract.Status == "Send" || contract.Status == "Request" || contract.Status == "Open"){
                var waitTime = new Date(contractDate);
                waitTime.setDate(contractDate.getDate() +contractDate.Duration);
                if (now - waitTime > 0){
                  //contractFinish(contract.ContractId,contract.SellerEmail,contract.BuyerEmail,contract.Value);
                  contractDelete(contract.Status,contract.ContractId,contract.SellerEmail,contract.BuyerEmail,contract.Value);
                  contractList.splice(i, 1);
                }
                else{
                  if (waitTime < nearestTime){
                    nearestTime = waitTime;
                    console.log("checkTime Wait nearestTime = "+nearestTime);
                  }
                }
              }
              switch(contract.Status) {
                case "Paid":
                  // code block
                  var paidTime = new Date(contractDate);
                  paidTime.setDate(contractDate.getDate() +paid_days);
                  if (now - paidTime > 0){
                    contractFinish(contract.ContractId,contract.SellerEmail,contract.BuyerEmail,contract.Value);
                    contractList.splice(i, 1);
                  }
                  else{
                    if (paidTime < nearestTime){
                      nearestTime = paidTime;
                      console.log("checkTime Paid nearestTime = "+nearestTime);
                    }
                  }
                  
                  break;
                case "Rejected":
                  var rejectTime = new Date(contractDate);
                  rejectTime.setDate(contractDate.getDate() +reject_days);
                  if (now - rejectTime > 0){
                    contractRefund(contract.ContractId,contract.SellerEmail,contract.BuyerEmail,contract.Value);
                    contractList.splice(i, 1);
                  }
                  else{
                    if (rejectTime < nearestTime){
                      nearestTime = rejectTime;
                      console.log("checkTime Rejected nearestTime = "+nearestTime);
                    }
                  }
                  
                  // code block
                  break;
                case "Claim":
                  var claimTime = new Date(contractDate);
                  claimTime.setDate(contractDate.getDate() +claim_days);
                  if (now - claimTime > 0){
                    contractSplit(contract.ContractId,contract.SellerEmail,contract.BuyerEmail,contract.Value);
                    contractList.splice(i, 1);
                  }
                  else{
                    if (claimTime < nearestTime){
                      nearestTime = claimTime;
                      console.log("checkTime Claim nearestTime = "+nearestTime);
                    }
                  }
                  
                  // code block
                  break;
                default:
                  // code block
              }
              /*
              const diffMinutes = Math.floor((now - contractDate) / (1000 * 60)); // Tính sai lệch theo phút
              console.log(`checkTime Contract ID: ${contract.id}, Time Difference: ${diffMinutes} minutes`);
              if (diffMinutes > 4320) //mautran
              {
                switch(contract.Status) {
                  case "Paid":
                    // code block
                    contractFinish(contract.ContractId,contract.SellerEmail,contract.BuyerEmail,contract.Value);
                    contractList.splice(i, 1);
                    break;
                  case "Rejected":
                    contractRefund(contract.ContractId,contract.SellerEmail,contract.BuyerEmail,contract.Value);
                    contractList.splice(i, 1);
                    // code block
                    break;
                  case "Claim":
                    contractSplit(contract.ContractId,contract.SellerEmail,contract.BuyerEmail,contract.Value);
                    contractList.splice(i, 1);
                    // code block
                    break;
                  default:
                    // code block
                }
              }
              */
              /*
              // So sánh thời gian hiện tại với LastDate
              const now = new Date();
              const LastDate = contract.LastDate ? new Date(contract.LastDate) : null;
              
              if (LastDate && LastDate < now) {
                  console.log("older");
              }
              if (contract === 3) { // điều kiện để xóa
                  contracts.splice(i, 1);
              }
              */
            }
          }
          
      } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
      }
    });
    /*
    // Kiểm tra xem có phải là 9h sáng không
    if (hours === 9 && minutes === 0) {
        acb();
    }
    */
}

// Gọi hàm checkTime mỗi phút
setInterval(checkTime, 60000);
//setInterval(checkTime, 1000);
// Khởi động hàm ngay khi chạy ứng dụng để kiểm tra ngay lập tức
checkTime();
//================================================================================

async function contractDelete(contractStatus,contractId,sellerEmail,buyerEmail,contract_value)
{
/*
Paid -> Finish
+ Buyer: out_money giảm;
+ Seller: in_money giảm;
+ Seller: money tăng

Constract: Status
*/
  var moneyIn = 0;
  if (contract_value * AGREE_FEE_RATION < MIN_FEE)
    moneyIn = contract_value - MIN_FEE;
  else
    moneyIn = parseInt(contract_value * (1 - AGREE_FEE_RATION));

  var moneySign = 0;
  if (contract_value * SIGN_FEE_RATION < MIN_FEE)
    moneySign = contract_value - MIN_FEE;
  else
    moneySign = parseInt(contract_value * (1 - SIGN_FEE_RATION));

  if (contractStatus == "Send")
    incrementMoneyOut(buyerEmail,contract_value*-1,contract_value);
  //incrementMoneyIn(sellerEmail,moneySign*-1,moneyIn);
  updateContractStatus(contractId, "Ovt_Detele");
}

async function contractFinish(contractId,sellerEmail,buyerEmail,contract_value)
{
/*
Paid -> Finish
+ Buyer: out_money giảm;
+ Seller: in_money giảm;
+ Seller: money tăng

Constract: Status
*/
  var moneyIn = 0;
  if (contract_value * AGREE_FEE_RATION < MIN_FEE)
    moneyIn = contract_value - MIN_FEE;
  else
    moneyIn = parseInt(contract_value * (1 - AGREE_FEE_RATION));

  var moneySign = 0;
  if (contract_value * SIGN_FEE_RATION < MIN_FEE)
    moneySign = contract_value - MIN_FEE;
  else
    moneySign = parseInt(contract_value * (1 - SIGN_FEE_RATION));
  incrementMoneyOut(buyerEmail,contract_value*-1,0);
  incrementMoneyIn(sellerEmail,moneySign*-1,moneyIn);
  updateContractStatus(contractId, "Ovt_Finished");
}
async function contractRefund(contractId,sellerEmail,buyerEmail,contract_value)
{
  console.log("contractRefund -------------------------------");
/*
Reject -> Refund
+ Buyer: out_money giảm;
+ Seller: in_money giảm;
+ Buyer: money tăng
*/
  var moneyIn = 0;
  if (contract_value * REFUND_FEE_RATION < MIN_FEE)
    moneyIn = contract_value - MIN_FEE;
  else
    moneyIn = parseInt(contract_value * (1 - REFUND_FEE_RATION));

  var moneySign = 0;
  if (contract_value * SIGN_FEE_RATION < MIN_FEE)
    moneySign = contract_value - MIN_FEE;
  else
    moneySign = parseInt(contract_value * (1 - SIGN_FEE_RATION));

  incrementMoneyOut(buyerEmail,contract_value*-1,moneyIn);
  incrementMoneyIn(sellerEmail,moneySign*-1,0);
  updateContractStatus(contractId, "Ovt_Refund");
}
async function contractSplit(contractId,sellerEmail,buyerEmail,contract_value)
{
/*
Claim -> Split
+ Buyer: out_money giảm;
+ Buyer: money tăng 60% của value
+ Seller: in_money giảm;
+ Seller: money tăng 20% của value
*/
  var moneyRefund = 0;
  if (contract_value * REFUND_FEE_RATION < MIN_FEE)
    moneyRefund = contract_value - MIN_FEE;
  else
    moneyRefund = parseInt(contract_value * (1 - REFUND_FEE_RATION));

  var moneySign = 0;
  if (contract_value * SIGN_FEE_RATION < MIN_FEE)
    moneySign = contract_value - MIN_FEE;
  else
    moneySign = parseInt(contract_value * (1 - SIGN_FEE_RATION));

  var money4Buyer = parseInt(0.6*moneyRefund);
  var money4Seller = parseInt(0.4*moneyRefund);
  incrementMoneyOut(buyerEmail,contract_value*-1,money4Buyer);
  incrementMoneyIn(sellerEmail,moneySign*-1,money4Seller);
  updateContractStatus(contractId, "Ovt_Split");
}
///=============================================================================================================
async function queryOrders(payOrderId, amountIn) {
  try {
    const ordersRef = db.collection('Orders');

    // Thực hiện truy vấn với các điều kiện
    const querySnapshot = await ordersRef
      .where('id', '==', payOrderId)
      .where('total', '==', amountIn)
      .where('payment_status', '==', 'Unpaid')
      .get();

    // Xử lý kết quả truy vấn
    if (querySnapshot.empty) {
      console.log('No matching documents found.');
    } else {
      querySnapshot.forEach(doc => {
        console.log('Document ID:', doc.id);
        console.log('Document Data:', doc.data());
      });
    }
  } catch (error) {
    console.error('Error querying documents:', error);
  }
}
async function findDocumentNameByXorId(xorId) {
  const usersCollection = db.collection('Users');
  var docId = '';
  try {
    // Tìm các document có trường `xorId` bằng giá trị mong muốn
    const snapshot = await usersCollection.where('xorId', '==', xorId).get();

    if (snapshot.empty) {
      console.log('No matching documents.');
      return null;
    }

    // Duyệt qua các document tìm được và in ra tên của chúng
    snapshot.forEach(doc => {
      console.log(`Document ID: ${doc.id}, Document Name: ${doc.data().name}`);
      docId =  doc.id.toString();
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return null;
  }
  return docId;
}
async function incrementActionNum(orderId, status, buyerEmail,bankName,bankAcc,note) {
  try {
    const contractRef = db.collection('Contracts').doc(orderId);
    const contractDoc = await contractRef.get();

    if (!contractDoc.exists) {
      console.log('No such document!');
      return;
    }
    var actionNum = contractDoc.data().ActionNum+1;
    // Cập nhật giá trị của trường ActionNum tăng thêm 1
    await contractRef.update({
      ActionNum: admin.firestore.FieldValue.increment(1),
      Status: status,
      BuyerEmail: buyerEmail,
      bankName: bankName,
      bankAcc: bankAcc,
      LastDate:new Date(),
    });

    console.log('incrementActionNum Document successfully updated!');
    const actionRef = db.collection('Contracts').doc(orderId).collection('Actions').doc(actionNum.toString());
    await actionRef.set({
      action: 'Paid',
      owner: buyerEmail,
      created: new Date(),
      note: note,
      actionOrder: actionNum,
      role: 'Buyer',
    });
  } catch (error) {
    console.error('Error updating document:', error);
  }
}
//async function incrementMoneyIn(sellerEmail,value) {
  async function incrementMoneyIn(userEmail,money_in_value,money_value) {
  try {
    //const sellerRef = db.collection('Users').doc(sellerEmail);
    const sellerRef = db.collection('Users').doc(userEmail);
    const sellerDoc = await sellerRef.get();

    if (!sellerDoc.exists) {
      console.log('No such document!');
      return;
    }
    
    const data = sellerDoc.data();
    const currentMoneyIn = data.money_in || 0;
    const currentMoney = data.money || 0;
    // Tăng giá trị money_in lên 100
    //sellerRef.update(sellerRef, { money_in: currentMoneyIn + 100 });
    
    // Cập nhật giá trị của trường ActionNum tăng thêm 1
    await sellerRef.update({
      //money_in: admin.firestore.FieldValue.increment(value),
      money_in: currentMoneyIn+money_in_value,
      money:currentMoney+money_value,
    });
    
    console.log('incrementMoneyIn Document successfully updated!');
  } catch (error) {
    console.error('Error updating document:', error);
  }
}
//async function incrementMoneyOut(buyerEmail,value) {
async function incrementMoneyOut(userEmail,money_out_value,money_value) {
  try {
    //const buyerRef = db.collection('Users').doc(buyerEmail);
    const buyerRef = db.collection('Users').doc(userEmail);
    const buyerDoc = await buyerRef.get();

    if (!buyerDoc.exists) {
      console.log('No such document!');
      return;
    }
    const data = buyerDoc.data();
    const currentMoneyOut = data.money_out || 0;
    const currentMoney = data.money || 0;
    // Tăng giá trị money_in lên 100
    //buyerRef.update(sellerRef, { money_out: currentMoneyIn + 100 });
    
    await buyerRef.update({
      //money_out: admin.firestore.FieldValue.increment(value),
      money_out: currentMoneyOut+money_out_value,
      money:currentMoney+money_value,
    });
    
    console.log('Document successfully updated!');
  } catch (error) {
    console.error('Error updating document:', error);
  }
}
async function updateContract(contractId, value, status, buyerEmail,bankName,bankAcc) {
  const contractsCollection = db.collection('Contracts');

  try {
    // Tìm các document có trường `ContractId` và `Value` khớp với giá trị mong muốn
    const snapshot = await contractsCollection
      .where('ContractId', '==', contractId)
      .where('Value', '==', value)
      .get();

    if (snapshot.empty) {
      console.log('updateContract No matching documents found.');
      return;
    }

    // Duyệt qua các document tìm được và cập nhật chúng
    const batch = db.batch();
    snapshot.forEach(doc => {
      const docRef = doc.ref;
      batch.update(docRef, {
        Status: status,
        BuyerEmail: buyerEmail,
        bankName: bankName,
        bankAcc: bankAcc,
        ActionNum: 1,
        LastDate:new Date(),
      });
    });

    // Commit các thay đổi
    await batch.commit();
    console.log('updateContract Documents successfully updated.');
  } catch (error) {
    console.error('updateContract Error updating documents:', error);
  }
}
async function updateContractStatus(contractId, status) {
  const contractsCollection = db.collection('Contracts');

  try {
    // Tìm các document có trường `ContractId` và `Value` khớp với giá trị mong muốn
    const snapshot = await contractsCollection
      .where('ContractId', '==', contractId)
      //.where('Value', '==', value)
      .get();

    if (snapshot.empty) {
      console.log('updateContractStatus No matching documents found.');
      return;
    }

    // Duyệt qua các document tìm được và cập nhật chúng
    const batch = db.batch();
    snapshot.forEach(doc => {
      const docRef = doc.ref;
      batch.update(docRef, {
        Status: status,
        LastDate:new Date(),
      });
    });

    // Commit các thay đổi
    await batch.commit();
    console.log('updateContract Documents successfully updated.');
  } catch (error) {
    console.error('updateContract Error updating documents:', error);
  }
}
// Gọi hàm với các giá trị bạn muốn cập nhật


/*
// Mã hóa
const encrypted = xorCipher('TAWF0V', 'NSYOIY');
console.log("Encrypted:", encrypted);

// Giải mã
const decrypted = xorCipher(encrypted, 'NSYOIY');
console.log("Decrypted:", decrypted);
*/
const cipher = new Cipher();
/*
// Mã hóa
const encoded = cipher.xorEncode('TAWF0V','NSYOIY');
console.log('Encoded:', encoded);

// Giải mã
//const decoded = cipher.xorDecode(encoded);
const decoded = cipher.xorDecode('Gg8ZCH4Y','NSYOIY');
console.log('Decoded:', decoded);
*/
// Middleware để phân tích dữ liệu JSON
app.use(express.json());

// Định nghĩa các route



// Handle POST requests to /transaction
app.post('/transaction', async (req, res) => {
  //để cho SePay
    const transactionData = req.body;
    var vippyTransId='';
vippyTransId=transactionData.content.substring(2,6);
    const data = {
      vippyTransId:vippyTransId,
      id: transactionData.id,
      gateway: transactionData.gateway,
      transactionDate: transactionData.transactionDate,
      accountNumber: transactionData.accountNumber,
      code: transactionData.code,
      content: transactionData.content, //Đây chính là mã đơn hàng để xác định giao dịch nào
      transferType: transactionData.transferType,
      transferAmount: transactionData.transferAmount,
      accumulated: transactionData.accumulated,
      subAccount: transactionData.subAccount,
      referenceCode: transactionData.referenceCode,
      description: transactionData.description,
      createdAt: new Date(),
    };

    // Log the received data
    console.log('Received transaction data:', transactionData);

    try {
        // Construct the query parameters from the transaction data
        //const queryParams = new URLSearchParams(transactionData).toString();

      var payId = transactionData.content;//'VPNSYOIY GhIOCXkP';
      var orderId = payId.substring(2,8);
      console.log('orderId:', orderId);
      var xoredCode = payId.substring(9,payId.length);
      console.log('xoredCode:', xoredCode);
      const decoded = cipher.xorDecode(xoredCode,orderId);
      console.log('Decoded:', decoded);

      var userEmail = await findDocumentNameByXorId(decoded)
      console.log('userEmail:', userEmail);
      console.log('transactionData.transferAmount:', transactionData.transferAmount);
      console.log('transactionData.gateway:', transactionData.gateway);
      console.log('transactionData.accountNumber:', transactionData.accountNumber);

      data['userEmail'] = userEmail;
      data['payId'] = payId;
      data['orderId'] = orderId;
      var contract = await db.collection('Contracts').doc(orderId).get();
      var contractData = contract.data();
      console.log('contractData:', contractData);
      data["SellerEmail"] = contractData.SellerEmail;
      data['Note'] = contractData.Note;
      data['Content'] = contractData.Content;
      db.collection('Transactions').doc().set(data);
      //updateContract(orderId, transactionData.transferAmount, 'Paid', userEmail,transactionData.gateway,transactionData.accountNumber);
      incrementActionNum(orderId, 'Paid', userEmail,transactionData.gateway,transactionData.accountNumber,'');
      incrementMoneyIn(contractData.SellerEmail,transactionData.transferAmount,0);
      incrementMoneyOut(userEmail,transactionData.transferAmount,0);
// Gọi hàm với các tham số cụ thể
      //queryOrders(vippyTransId, transactionData.transferAmount);

      // Respond with a success message
      res.status(200).json({
          message: 'Transaction data forwarded successfully!',
          data: 'aaaa'//response.data
      });
    } catch (error) {
        console.error('Error forwarding transaction data:', error);
        res.status(500).json({
            message: 'Error forwarding transaction data',
            error: error.message
        });
    }
    /*
    // Respond with a success message
    res.status(200).json({
        message: 'Transaction data received successfully!',
        data: transactionData
    });
    */
});
// Route để thêm một tài liệu vào Firestore
app.post('/add', async (req, res) => {
  try {
    const { collectionName, data } = req.body;
    const docRef = db.collection(collectionName).doc();
    await docRef.set(data);
    res.status(201).send('Document added');
  } catch (error) {
    console.error('Error adding document: ', error);
    res.status(500).send('Error adding document');
  }
});

// Route để lấy tài liệu từ Firestore
app.get('/get/:collectionName/:docId', async (req, res) => {
  try {
    const { collectionName, docId } = req.params;
    const docRef = db.collection(collectionName).doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404).send('No such document');
    } else {
      res.status(200).json(doc.data());
    }
  } catch (error) {
    console.error('Error getting document: ', error);
    res.status(500).send('Error getting document');
  }
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
