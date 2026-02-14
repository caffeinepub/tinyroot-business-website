# Specification

## Summary
**Goal:** Only show Razorpay payment options after an order is successfully placed, and tie the payment to that specific order.

**Planned changes:**
- Remove the standalone Razorpay payment CTA/flow from product cards in the Products section, while keeping the existing “Order Now” scroll-to-order-form behavior.
- After successful order creation from the Order Form, show a post-order “Pay now” option that references the created order (order ID and total amount) and provides processing/success/cancel/error feedback in English.
- Add a backend method/API to mark an existing order as paid using (orderId, razorpayPaymentId), enforcing that only the order’s customer principal or an admin can perform the update.
- Wire the end-to-end post-order payment flow: on Razorpay success, call the backend to update the order’s paymentStatus to paid, then update the frontend state; if the backend update fails, show an English support message including order ID and payment ID.

**User-visible outcome:** Customers place an order first, then are offered a “Pay now” option for that specific order amount; successful payment marks the order as paid and updates the UI, with clear English status messages.
