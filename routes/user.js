const express = require("express");
const router = express.Router();
const cron = require("node-cron");
const { protect, adminProtect } = require("../middleware/auth");
const {

  getAccountDetails,
  updateAccountDetails,
  getWithdrawPaymentRequest,
  getUserProfile,
  myTeamMembers,
  getAllTeamTree,
  // PurchaseBull,
  updateToZero,
  Recharge_to_Trading,
  BotLevelIncome,
  withdrawlRequest,
  getUserWithdrawalRequests,
  updateTradingIncome,
  UserTradingIncome,
  UserMatchingIncome,
  distributeRankIncome,
} = require("../controllers/userController");
const {
  getAllProducts,
  getPoster,
} = require("../controllers/productController");
// const { getSalaryDetails } = require("../controllers/salary");
const {PurchaseBull,addTradingWalletToAllUsers} =require('../controllers/testController')

const {getCryptocurrencyListings}=require('../controllers/coinmarketcap')

router.put("/add-new-key-in-user", addTradingWalletToAllUsers)


//purchase bull
router.post("/purchase-bull/:id", protect, PurchaseBull);
router.get("/bot-level-income/:userId", protect, BotLevelIncome);
router.get("/matching-income/:userId", protect, UserMatchingIncome);
router.get("/crypto-listing", getCryptocurrencyListings);
router.get("/trading-income/:userId", protect, UserTradingIncome);
router.post("/recharge-to-trading/:userId", protect, Recharge_to_Trading);
router.post("/withdrawl-request/:userId", protect, withdrawlRequest);
router.get("/withdrawal-requests/:userId", protect, getUserWithdrawalRequests);
router.get("/profile/:id", protect, getUserProfile);
router.get("/withdraw-transactions/:id", protect, getWithdrawPaymentRequest);
router.get("/team-members/:id/:level", protect, myTeamMembers);
router.get('/:userId/tree',getAllTeamTree)
router.patch("/update/account-details/:userId", updateAccountDetails);
router.get("/get/account-details/:userId", getAccountDetails);


// Cron jobs

// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// ****************************************************
//                                                    *
// cron.schedule('30 18 * * *', updateDailySalaryForAllActiveUsers)
// cron.schedule('30 18 * * *', calculateDailyProfits);
cron.schedule('30 18 * * *', updateToZero);//  *
// cron.schedule('* * * * *', updateTradingIncome);//  *
const cron = require('node-cron');

cron.schedule('0 0 * * *', () => {
  // Convert 12:00 AM IST to UTC
  const IST_UTC_OFFSET = 5.5; // IST is UTC+5:30
  const currentHourUTC = new Date().getUTCHours();
  const currentDayUTC = new Date().getUTCDay(); // Get the current day of the week (0-6)

  // Check if it's a weekday (Monday to Friday)
  if (currentHourUTC === 18.5 && currentDayUTC !== 0 && currentDayUTC !== 6) { // 0 = Sunday, 6 = Saturday
    updateTradingIncome();
    distributeRankIncome();
  }
}, {
  timezone: "Asia/Kolkata"
});

//                                                    *
// ****************************************************
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// do not touch this otherwise I will show you my power
// cron.schedule('0 0 * * *', calculateDailyReferralProfits);

module.exports = router;