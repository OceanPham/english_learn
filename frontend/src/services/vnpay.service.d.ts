import { VNPayPaymentData, VNPayResponse } from '../types/auth.types';

declare const vnpayApi: {
  createPayment(orderInfo: VNPayPaymentData): Promise<VNPayResponse>;
};

export default vnpayApi; 