const express = require("express");
const {
  getTotalUSDCollection,
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
  managePackages,
  distributeWeeklySalaries,
  distributeMonthlySalaries,
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
router.get("/all-users", adminProtect, getAllUsers);
router.get("/update-user", adminProtect, updateUserProfile);
router.put("/user/:id", adminProtect, updateUserBlockedStatus);
router.get("/unpaid-users", adminProtect, getAllUnPaidUsers);
router.get("/all-requests", adminProtect, ALLFundRequests);
router.put(
  "/update-payment-status/:transactionId",
  adminProtect,
  UpdatePaymentStatus
);
router.get("/all-blocked-users", adminProtect, getAllBlockedUsers);
router.get("/all-active-users", adminProtect, getAllActiveUsers);
router.get("/transactions", adminProtect, getAllTransactions);
router.get("/total-collection", adminProtect, getTotalINRCollection);
router.get("/withdrawal-requests", adminProtect, getAllWithdrawRequests);
router.post("/add-product", adminProtect, addProduct);
router.get("/products", adminProtect, getAllProducts);
router.delete("/delete-product/:id", adminProtect, deleteProduct);
router.put("/update-product/:id", adminProtect, updateProduct);
router.put("/activate-user", adminProtect, activateUser);
router.put("/update-poster", adminProtect, updatePoster);
router.put("/add-deduct", adminProtect, addOrDeductWallet);
router.put("/user-update/:id", adminProtect, updateUser);
router.get('/qr-payment-requests', adminProtect, getAllQrPaymentRequests);
router.put('/qr-payment-approve', adminProtect, approveQRPayment);
router.put('/qr-payment-reject', adminProtect, rejectQRPayment);

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
