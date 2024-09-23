// routes/chatbot.js
const express = require('express');
const router = express.Router();

// Define rules and responses specific to your MLM application
const chatbotResponses = {
  "hello": "Hi there! How can I assist you today?",
  "check balance": "To check your wallet balance, please go to the 'Wallet' section on your dashboard.",
  "view referral history": "You can view your referral history in the 'Referral' section of your dashboard.",
  "how to earn profits": "You can earn profits by referring others to join the platform and by participating in our various packages. Visit the 'How It Works' page for more details.",
  "how to refer": "To refer someone, share your unique referral code found in the 'Referral' section. Your referrals will be tracked automatically.",
  "what is my referral code": "Your referral code is available in the 'Referral' section of your dashboard.",
  "how to withdraw earnings": "You can withdraw your earnings by going to the 'Wallet' section and selecting the 'Withdraw' option.",
  "how to recharge wallet": "To recharge your wallet, go to the 'Wallet' section and click on 'Recharge'. Follow the instructions to complete the payment.",
  "what packages are available": "We offer several packages with different levels of benefits. Visit the 'Packages' section to view the available options.",
  "help": "I'm here to assist with any questions you have about your account or the platform. Please feel free to ask!",
  "contact support": "If you need further assistance, please contact our support team at support@yourmlmplatform.com."
  // Add more rules as needed
};

// Chatbot endpoint
router.post('/chat', (req, res) => {
  const userMessage = req.body.message.toLowerCase();
  const response = chatbotResponses[userMessage] || "Sorry, I didn't understand that. Can you please rephrase?";

  res.json({ reply: response });
});

module.exports = router;
