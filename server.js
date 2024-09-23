const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const chatbotRoute = require('./routes/chatbot');
const upiPaymentRoutes = require('./routes/upiPayment')
const payoutRoutes = require('./routes/payout')
const { calculateDailyProfits, calculateDailyReferralProfits, uptimeRobot } = require('./controllers/userController');
// const { sendSmsCode } = require('./controllers/authController'); // Corrected the import path
const cron = require('node-cron');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const {addGameProfitToUsers} = require('./routes/testing');
const { calculateLegBusinessPerLevel } = require('./controllers/business');

dotenv.config();



const app = express();
app.use(cors());

app.use(express.json());
app.use(fileUpload({
  useTempFiles: true, // Enable temporary file storage for file uploads
  tempFileDir: '/tmp/', // Directory where temp files will be stored
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// app.post('/api/v1/send-sms', sendSmsCode); // Changed from router to app and added the correct path
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/chatbot', chatbotRoute);
// app.use('/api/v1/upi-payment',upiPaymentRoutes);
app.use('/api/v1/payout',payoutRoutes);
app.use('/api/v1/test-with',addGameProfitToUsers)
app.get('/api/v1/user/salary/:userId', async (req, res) => {
  try {
    const user = req.params.userId; // Assuming user is authenticated
    const levelsData = await calculateLegBusinessPerLevel(user);

    res.json({ levels: levelsData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch salary data' });
  }
});




app.get('/keep-alive', (req, res) => {
  res.status(200).send('Server is alive');
});
// Schedule daily, weekly, and monthly jobs
// cron.schedule('0 0 * * *', calculateDailyProfits);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port  ${PORT}`);
});