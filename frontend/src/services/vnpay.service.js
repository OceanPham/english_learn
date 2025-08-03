import HmacSHA512 from 'crypto-js/hmac-sha512';
import qs from 'qs';

const config = {
    tmnCode: 'B77INC60',
    secretKey: 'NU3W61XPNAW4DDRSYM30E0G4GL97VG7M',
    vnpUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
};

const vnpayApi = {
    createPayment: async (orderInfo) => {
        try {
            const date = new Date();
            // Format createDate theo đúng chuẩn yêu cầu
            const createDate = date.getFullYear().toString() +
                             ('0' + (date.getMonth() + 1)).slice(-2) +
                             ('0' + date.getDate()).slice(-2) +
                             ('0' + date.getHours()).slice(-2) +
                             ('0' + date.getMinutes()).slice(-2) +
                             ('0' + date.getSeconds()).slice(-2);

            // Tạo mã giao dịch ngẫu nhiên 8 chữ số
            const txnRef = Array(8).fill(0).map(() => Math.floor(Math.random() * 10)).join('');

            if (!orderInfo.return_url) {
                throw new Error('returnUrl is required');
            }

            const queryParams = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: config.tmnCode,
                vnp_Locale: 'vn',
                vnp_CurrCode: 'VND',
                vnp_TxnRef: txnRef,
                vnp_OrderInfo: `Thanh toan don hang :${txnRef}`,
                vnp_OrderType: 'other',
                vnp_Amount: parseInt(orderInfo.price * 100),
                vnp_ReturnUrl: orderInfo.return_url,
                vnp_IpAddr: orderInfo.ipAddr || '127.0.0.1',
                vnp_CreateDate: createDate
            };

            const sortedParams = Object.keys(queryParams)
                .sort()
                .reduce((acc, key) => {
                    if (queryParams[key] !== '' && queryParams[key] !== null && queryParams[key] !== undefined) {
                        acc[key] = queryParams[key];
                    }
                    return acc;
                }, {});

            // Sử dụng encodedURI thay vì qs.stringify
            const signData = Object.entries(sortedParams)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&')
                .replace(/%20/g, '+');  

            const signed = HmacSHA512(signData, config.secretKey).toString();
            const paymentUrl = `${config.vnpUrl}?${signData}&vnp_SecureHash=${signed}`;
            
            return { paymentUrl };
        } catch (error) {
            console.error('VNPAY Payment Error:', error);
            throw error;
        }
    }
};

export default vnpayApi; 