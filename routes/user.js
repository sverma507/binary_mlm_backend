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
  PurchaseBull,
  updateToZero
} = require("../controllers/userController");

//purchase bull
router.post("/purchase-bull/:id", protect, PurchaseBull);
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