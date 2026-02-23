const { Resend } = require('resend');

const sendPriceAlert = async ({ email, origin, destination, price, targetPrice }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'Flight Tracker <onboarding@resend.dev>',
    to: email,
    subject: `Price Alert: ${origin} → ${destination} dropped to $${price}!`,
    html: `
      <h2>Your flight price alert was triggered!</h2>
      <p>The price for <strong>${origin} → ${destination}</strong> has dropped to <strong>$${price}</strong>.</p>
      <p>Your target price was <strong>$${targetPrice}</strong>.</p>
      <p>Book now before the price goes back up!</p>
    `,
  });
};

module.exports = sendPriceAlert;