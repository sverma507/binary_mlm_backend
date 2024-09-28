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
  getAllTransactions,
  activateUser,
  updateUserProfile,
  addOrDeductWallet,
  getActivationList,
  getDownlineUsers,
  getAllQrPaymentRequests,
  approveQRPayment,
  rejectQRPayment
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
router.get("/unpaid-users", adminProtect, getAllUnPaidUsers);
router.get("/all-active-users", adminProtect, getAllActiveUsers);
router.get("/withdrawal-requests", adminProtect, getAllWithdrawRequests);
router.put("/user-update/:id", adminProtect, updateUser);

router.put(
  "/update-withdrawl-payment-status/:transactionId",
  adminProtect,
  updateWithdrawlPaymentStatus
);
router.get("/activation-list", adminProtect, getActivationList);
router.get("/downline/:userId", adminProtect, getDownlineUsers);

// router.post('/distribute-weekly-salaries', adminProtect, distributeWeeklySalaries);
// router.post('/distribute-monthly-salaries', adminProtect, distributeMonthlySalaries);

module.exports = router;
