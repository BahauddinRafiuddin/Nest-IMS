import * as crypto from 'crypto';

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
) => {
  const body = orderId + '|' + paymentId;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};