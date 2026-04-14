/* eslint-disable no-unused-vars */
// services/razorpay.service.js
import { createPaymentOrder, verifyPayment } from "../api/intern.api";

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export const initiatePayment = async ({
  enrollment,
  onSuccess,
  onFailure,
}) => {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    onFailure("Razorpay SDK failed to load");
    return;
  }

  try {
    const orderRes = await createPaymentOrder(enrollment._id);
    const { order } = orderRes;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "IMS Platform",
      description: enrollment.program.title,
      order_id: order.id,

      handler: async function (response) {
        try {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            enrollmentId: enrollment._id,
          });

          onSuccess();
        } catch (err) {
          onFailure("Payment verification failed");
        }
      },

      theme: {
        color: "#4f46e5",
      },
      modal: {
        ondismiss: function () {
          onFailure("Payment cancelled");
        },
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

  } catch (err) {
    onFailure(err.response?.data?.message || "Payment failed");
  }
};