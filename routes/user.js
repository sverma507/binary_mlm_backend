const express = require("express");
const router = express.Router();
const cron = require("node-cron");
const { protect, adminProtect } = require("../middleware/auth");
const {
  getAccountDetails,
  updateAccountDetails,
  getAllTransactions,
  getWithdrawPaymentRequest,
  getUserProfile,
  buyPackage,
  getReferralHistory,
  getUserActivity,
  calculateDailyProfits,
  calculateDailyReferralProfits,
  myTeamMembers,
  myProjects,
  claimDailyIncome,
  getSelfBonusList,
  getDailyIncomeList,
  getLevelIncomeList,
  getReferralsIncomeList,
  addGamePrize,
  deductWalletOnGame,
  getGameIncomeList,
  getActivationList,
  getAllSelfBonusList,
  updateDailySalaryForAllActiveUsers,
} = require("../controllers/userController");
const {
  getAllProducts,
  getPoster,
} = require("../controllers/productController");
// const { getSalaryDetails } = require("../controllers/salary");

// User routes
router.get("/profile/:id", protect, getUserProfile);
router.get("/my-products/:id", protect, myProjects);
router.post("/buy-package", protect, buyPackage);
router.get("/referral-history", protect, getReferralHistory);
router.get("/user-activity", protect, getUserActivity);
router.get("/all-transactions/:id", protect, getAllTransactions);
router.get("/withdraw-transactions/:id", protect, getWithdrawPaymentRequest);
router.get("/team-members/:id/:level", protect, myTeamMembers);

// Account routes
router.patch("/update/account-details/:userId", updateAccountDetails);
router.get("/get/account-details/:userId", getAccountDetails);

// Product routes
router.get("/products", protect, getAllProducts);
router.get("/home-products", getAllProducts);
router.get("/poster", getPoster);

// Bonus and Income routes
router.put("/claim-profit", protect, claimDailyIncome);
// router.get("/self-bonus-list/:id", protect, getSelfBonusList);
router.get("/self-income-list/", protect, getAllSelfBonusList);
router.get("/daily-income-list/:id", protect, getDailyIncomeList);
router.get("/level-income-list/:id", protect, getLevelIncomeList);
router.get("/referral-income-list/:id", protect, getReferralsIncomeList);
router.get("/game-income-list/:id", protect, getGameIncomeList);
// router.get("/api/v1/user/salary/:userId", protect, getSalaryDetails);


// Game routes
router.post("/add-prizes", protect, addGamePrize);
router.put('/deduct-wallet-game', protect, deductWalletOnGame);

// Cron jobs

// do not touch this otherwise I fuck you

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
cron.schedule('30 18 * * *', updateDailySalaryForAllActiveUsers)
cron.schedule('30 18 * * *', calculateDailyProfits);//  *
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