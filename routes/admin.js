const express = require("express");
const {
  getTotalINRCollection,
  updateUser,
  updateWithdrawlPaymentStatus,
  getAllWithdrawRequests,
  ALLFundRequests,
  UpdatePaymentStatus,
  getAllUsers,
  getAllBlockedUsers,
  updateUserBlockedStatus,
  getAllActiveUsers,
  getAllUnPaidUsers,
  activateUser,
  updateUserProfile,
  addOrDeductWallet,
  getActivationList,
  getDownlineUsers,
  getAddDeductList,
  update_withdrawl_request_status,
  getAllTradingTransactions
} = require("../controllers/adminController");
const { adminProtect } = require("../middleware/auth");
const {
  addProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
  updatePoster,
} = require("../controllers/productController");

const { Adminlogin, AdminRegister } = require("../controllers/adminController");
const router = express.Router();

router.post("/login", Adminlogin);
router.post("/register", AdminRegister);
router.get("/all-users", getAllUsers);
router.get("/update-user", adminProtect, updateUserProfile);
router.put("/user/:id", adminProtect, updateUserBlockedStatus);
router.get("/unpaid-users", adminProtect, getAllUnPaidUsers);
router.get("/all-active-users", adminProtect, getAllActiveUsers);
router.get("/withdraw-requests", adminProtect, getAllWithdrawRequests);
router.get("/update-withdraw-requests/:id", adminProtect, update_withdrawl_request_status);
router.put("/user-update/:id", adminProtect, updateUser);
router.put("/add-deduct", adminProtect, addOrDeductWallet);
router.get("/add-deduct-list", adminProtect, getAddDeductList);
router.get("/all-blocked-users", adminProtect, getAllBlockedUsers);
router.get("/trading-transactions", adminProtect, getAllTradingTransactions);

router.put(
  "/update-withdrawl-payment-status/:transactionId",
  adminProtect,
  updateWithdrawlPaymentStatus
);
router.get("/activation-list", adminProtect, getActivationList);
router.get("/downline/:userId", adminProtect, getDownlineUsers);
router.put("/activate-user", adminProtect, activateUser);

// router.post('/distribute-weekly-salaries', adminProtect, distributeWeeklySalaries);
// router.post('/distribute-monthly-salaries', adminProtect, distributeMonthlySalaries);

module.exports = router;
