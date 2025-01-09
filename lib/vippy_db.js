/**
 * Kiểm tra xem liệu một Deposit có thỏa mãn điều kiện:
 * - createdTime < thời gian hiện tại - 15 phút
 * - Status == "Pending"
 * 
 * Nếu thỏa mãn điều kiện, cập nhật Status thành "Finish"
 * 
 * @param {_docId} documentId - ID của document cần kiểm tra
 * @returns {Promise<boolean>} - true nếu thỏa mãn điều kiện, ngược lại false
 */
async function checkDeposit(admin,db,_docId,_depositValue) {
    console.log("_docId = "+_docId)
    console.log("_depositValue = "+_depositValue)
    try {
        // Lấy document từ collection "Deposits" với documentId là _docId
        const depositRef = db.collection('Deposits').doc(_docId);
        const docSnapshot = await depositRef.get();

        // Kiểm tra xem tài liệu có tồn tại không
        if (!docSnapshot.exists) {
            console.log('Document không tồn tại.');
            return false;
        }

        const data = docSnapshot.data();
        const currentTime = admin.firestore.Timestamp.now();
        const createdTime = data.createdTime;
        const email = data.email;
        console.log("email = "+email)
        console.log("createdTime = "+createdTime)
        console.log("data.value = "+data.value)
        console.log("data.status = "+data.status)
        // Kiểm tra nếu có trường createdTime và Status
        if (!createdTime || data.status !== 'Pending' || data.value !== _depositValue) {
            console.log("Co dk ko thoa man");
            return false;
        }

        // Tính thời gian chênh lệch giữa thời gian hiện tại và createdTime
        const timeDifference = currentTime.seconds - createdTime.seconds;

        // Kiểm tra xem createdTime có nhỏ hơn thời gian hiện tại 15 phút hay không
        const isWithin15Minutes = timeDifference <= 15 * 60;

        if (isWithin15Minutes) {
            // Cập nhật Status thành "Finish" nếu thỏa mãn điều kiện
            await depositRef.update({
                status: 'Finish'
            });
            changeBalance(admin,db,email, _depositValue)
            .then(result => {
                if (result) {
                    console.log(`Cập nhật số dư thành công cho người dùng ${userId}`);
                } else {
                    console.log(`Cập nhật số dư không thành công.`);
                }
            })
            .catch(error => {
                console.error('Có lỗi xảy ra:', error);
            });
            console.log(`Deposit ${_docId} đã được cập nhật thành "Finish"`);
            return true; // Trả về true nếu đã cập nhật thành công
        }
        else{
            console.log(`Giao dich qua thoi gian`);
        }

        return false;
    } catch (error) {
        console.error('Lỗi khi kiểm tra và cập nhật Deposit:', error);
        return false;
    }
}

/**
 * Hàm cập nhật số dư của người dùng
 * 
 * @param {_userId} userId - ID của người dùng cần cập nhật
 * @param {_money} money - Số tiền cần cộng vào số dư hiện tại
 * @returns {Promise<boolean>} - true nếu cập nhật thành công, ngược lại false
 */
async function changeBalance(admin,db,_userId, _money) {
    try {
        // Lấy document của người dùng từ collection "Users" với documentId là _userId
        const userRef = db.collection('Users').doc(_userId);
        const userSnapshot = await userRef.get();

        // Kiểm tra nếu tài liệu người dùng tồn tại
        if (!userSnapshot.exists) {
            console.log('Người dùng không tồn tại.');
            return false;
        }

        const userData = userSnapshot.data();

        // Cập nhật giá trị money của người dùng
        await userRef.update({
            money: admin.firestore.FieldValue.increment(_money)
        });

        console.log(`Cập nhật số dư cho người dùng ${_userId}`);
        return true;
    } catch (error) {
        console.error('Lỗi khi thay đổi số dư:', error);
        return false;
    }
}

// Export hàm checkDeposit để có thể sử dụng ở nơi khác
module.exports = { checkDeposit,changeBalance };
