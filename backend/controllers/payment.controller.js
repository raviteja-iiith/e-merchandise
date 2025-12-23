import Stripe from 'stripe';
import Order from '../models/Order.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    metadata: { userId: req.user._id.toString() }
  });

  res.status(200).json({
    success: true,
    data: { clientSecret: paymentIntent.client_secret }
  });
});

export const confirmPayment = asyncHandler(async (req, res, next) => {
  const { paymentIntentId, orderId } = req.body;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === 'succeeded') {
    const order = await Order.findOne({ orderId });
    if (order) {
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      order.paymentId = paymentIntentId;
      await order.save();
    }

    res.status(200).json({ success: true, message: 'Payment confirmed', data: { order } });
  } else {
    return next(new AppError('Payment failed', 400));
  }
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Handle successful payment
    console.log('Payment succeeded:', paymentIntent.id);
  }

  res.json({ received: true });
});
