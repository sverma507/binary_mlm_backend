const User = require("../models/User");
const Product = require("../models/addPackage");
const WithdrawPaymentRequest = require("../models/withdrawPaymentRequest");
const botIncome = require("../models/botIncome");

// Adjust the path to your User model

exports.signupController = async (req, res) => {
  const { email, phone, password, referredBy, preferredSide } = req.body;
  console.log("dataa=>>>", req.body);

  try {
    // Check if the email already exists in the database
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Check if the phone number already exists in the database
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already exists." });
    }

    // 1. Check if this is the first user (no users in the system)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      // If this is the first user, no need for referredBy or preferredSide
      const newUser = new User({
        email,
        phone,
        password,
        referralCode: generateReferralCode(),
      });

      await newUser.save();
      return res
        .status(201)
        .json({ message: "First user successfully created!", user: newUser });
    }

    let parentUser;

    // 2. If referredBy is provided, find the parent by referral code
    if (referredBy) {
      parentUser = await User.findOne({ referralCode: referredBy });
      if (!parentUser) {
        return res.status(400).json({ message: "Invalid referral code." });
      }
    }

    // 4. Ensure the preferredSide input is valid
    if (preferredSide !== "left" && preferredSide !== "right") {
      return res
        .status(400)
        .json({ message: 'preferredSide must be either "left" or "right".' });
    }

    // 5. Traverse the binary tree to find an available preferredSide based on the user's choice (left or right)
    const targetParent = await findAvailablepreferredSide(
      parentUser,
      preferredSide
    );

    // 6. If no preferredSide is available (this case is unlikely but can occur if something goes wrong)
    if (!targetParent) {
      return res
        .status(500)
        .json({
          message: "No available preferredSide found. Please try again.",
        });
    }

    // 7. Create the new user
    const newUser = new User({
      email,
      phone,
      password,
      referralCode: generateReferralCode(), // Implement a function to generate a unique referral code
      referredBy: targetParent.referralCode,
    });

    // 8. Assign the user to the appropriate preferredSide (left or right)
    if (preferredSide === "left" && !targetParent.leftChild) {
      targetParent.leftChild = newUser._id;
    } else if (preferredSide === "right" && !targetParent.rightChild) {
      targetParent.rightChild = newUser._id;
    }

    // 9. Save both the parent and the new user
    await newUser.save();
    await targetParent.save();

    // 10. Respond with success
    return res
      .status(201)
      .json({ message: "User successfully created!", user: newUser });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.getAllTeamTree = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId).populate("leftChild rightChild");

    // Create a recursive function to build the tree structure
    const buildUserTree = (user) => {
      if (!user) return null;

      const leftChild = user.leftChild ? buildUserTree(user.leftChild) : null;
      const rightChild = user.rightChild
        ? buildUserTree(user.rightChild)
        : null;

      const tree = {
        name: user.email, // You can change this to any user field like name
        children: [],
      };

      if (leftChild) tree.children.push(leftChild);
      if (rightChild) tree.children.push(rightChild);

      return tree;
    };

    const treeData = buildUserTree(user);

    res.json(treeData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user tree." });
  }
};

// Recursive function to find an available preferredSide in the binary MLM tree
const findAvailablepreferredSide = async (user, preferredSide) => {
  // Check if the desired preferredSide is available
  if (preferredSide === "left") {
    if (!user.leftChild) {
      return user; // Return the user if the left preferredSide is vacant
    } else {
      // Traverse down the left subtree
      const leftChild = await User.findById(user.leftChild);
      return await findAvailablepreferredSide(leftChild, "left"); // Continue recursively
    }
  } else if (preferredSide === "right") {
    if (!user.rightChild) {
      return user; // Return the user if the right preferredSide is vacant
    } else {
      // Traverse down the right subtree
      const rightChild = await User.findById(user.rightChild);
      return await findAvailablepreferredSide(rightChild, "right"); // Continue recursively
    }
  }
};

// Helper function to generate a unique referral code
const generateReferralCode = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
  return `UTI${randomNumber}`;
};















const countActiveUsersInSubtree = async (userId, count = 0) => {
  const user = await User.findById(userId).populate('leftChild').populate('rightChild');
  if (!user) return count;

  // Increment count if the user is active
  if (user.isActive) count++;

  // Recursively check the left and right children
  if (user.leftChild) {
    count = await countActiveUsersInSubtree(user.leftChild._id, count);
  }

  if (user.rightChild) {
    count = await countActiveUsersInSubtree(user.rightChild._id, count);
  }

  return count;
};

// Function to calculate matching income
const calculateMatchingIncome = async (parentId) => {
  try {
    const user = await User.findById(parentId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.matchingIncome>300) {
      console.log("matching Income 300")
      return
    }

    // Count active users on both the left and right sides of the tree
    const leftActiveCount = await countActiveUsersInSubtree(user.leftChild);
    const rightActiveCount = await countActiveUsersInSubtree(user.rightChild);

    // Check for 2:1 or 1:2 ratio
    const isMatchingPair = false 
     if(!user.hasReceivedFirstMatchingIncome){
      isMatchingPair=(leftActiveCount >= 2 && rightActiveCount >= 1) ||
      (leftActiveCount >= 1 && rightActiveCount >= 2);
      
      if(isMatchingPair){
        user.hasReceivedFirstMatchingIncome=true;
      }

     }else{
      isMatchingPair=(leftActiveCount == rightActiveCount);
      if(isMatchingPair){
        if(leftActiveCount == 5){
           user.rankSalaryActivation[0] = true;
           user.rankSalaryStartDate[0] = Date.now();
           await user.save();
        }else if(leftActiveCount == 15){
          user.rankSalaryActivation[1] = true;
          user.rankSalaryActivation[0] = false;
          user.rankSalaryStartDate[1] = Date.now();
          await user.save();
        }else if(leftActiveCount == 40){
          user.rankSalaryActivation[2] = true;
          user.rankSalaryActivation[1] = false;
          user.rankSalaryStartDate[2] = Date.now();
          await user.save();
        }else if(leftActiveCount == 90){
          user.rankSalaryActivation[3] = true;
          user.rankSalaryActivation[2] = false;
          user.rankSalaryStartDate[3] = Date.now();
          await user.save();
        }else if(leftActiveCount == 190){
          user.rankSalaryActivation[4] = true;
          user.rankSalaryActivation[3] = false;
          user.rankSalaryStartDate[4] = Date.now();
          await user.save();
        }else if(leftActiveCount == 440){
          user.rankSalaryActivation[5] = true;
          user.rankSalaryActivation[4] = false;
          user.rankSalaryStartDate[5] = Date.now();
          await user.save();
        }else if(leftActiveCount == 940){
          user.rankSalaryActivation[6] = true;
          user.rankSalaryActivation[5] = false;
          user.rankSalaryStartDate[6] = Date.now();
          await user.save();
        }else if(leftActiveCount == 1940){
          user.rankSalaryActivation[7] = true;
          user.rankSalaryActivation[6] = false;
          user.rankSalaryStartDate[7] = Date.now();
          await user.save();
        }else if(leftActiveCount == 4440){
          user.rankSalaryActivation[8] = true;
          user.rankSalaryActivation[7] = false;
          user.rankSalaryStartDate[8] = Date.now();
          await user.save();
        }else if(leftActiveCount == 9440){
          user.rankSalaryActivation[9] = true;
          user.rankSalaryActivation[8] = false;
          user.rankSalaryStartDate[9] = Date.now();
          await user.save();
        }else if(leftActiveCount == 16940){
          user.rankSalaryActivation[10] = true;
          user.rankSalaryActivation[9] = false;
          user.rankSalaryStartDate[10] = Date.now();
          await user.save();
        }else if(leftActiveCount == 26940){
          user.rankSalaryActivation[11] = true;
          user.rankSalaryActivation[10] = false;
          user.rankSalaryStartDate[11] = Date.now();
          await user.save();
        }else if(leftActiveCount == 41940){
          user.rankSalaryActivation[12] = true;
          user.rankSalaryActivation[11] = false;
          user.rankSalaryStartDate[12] = Date.now();
          await user.save();
        }else if(leftActiveCount == 66940){
          user.rankSalaryActivation[13] = true;
          user.rankSalaryActivation[12] = false;
          user.rankSalaryStartDate[13] = Date.now();
          await user.save();
        }else if(leftActiveCount == 116940){
          user.rankSalaryActivation[14] = true;
          user.rankSalaryActivation[13] = false;
          user.rankSalaryStartDate[14] = Date.now();
          await user.save();
        }else if(leftActiveCount == 216940){
          user.rankSalaryActivation[15] = true;
          user.rankSalaryActivation[14] = false;
          user.rankSalaryStartDate[15] = Date.now();
          await user.save();
        }
      }
     }

    if (isMatchingPair) {
      // Update the user's matching income
      user.matchingIncome += 5;  // Add $5 to matching income
      user.hasReceivedFirstMatchingIncome = false;
      await user.save();

      console.log(`Matching income updated for user: ${user.email}, new income: $${user.matchingIncome}`);
    } else {
      console.log('No matching pair found.');
    }

    return user;
  } catch (error) {
    console.error(error);
    throw new Error('Error in calculating matching income');
  }
};


exports.updateToZero=async ()=>{
  const all_users=await User.find();
  for(let tempuser in all_users){
    tempuser.totalIncome +=tempuser.matchingIncome;
    tempuser.matchingIncome=0;
   await tempuser.save();
  }
}



// Purchase Bull functionality
exports.PurchaseBull = async (req, res) => {
  console.log("Purchase Bull==>", req.params.id);

  try {
    // Fetch the user making the purchase
    const user = await User.findById(req.params.id);
    const userId = user._id;

    if (!user) {
      console.log(`User with ID: ${req.params.id} not found`);
      return res.status(404).json({ message:` User not found `});
    }

    // Check if the user has enough balance in the recharge wallet
    const bullPrice = 60; // Bull price is $60
    if (user.rechargeWallet < bullPrice) {
      console.log(
        `Insufficient balance in the recharge wallet for user: ${user.referralCode}`
      );
      return res
        .status(400)
        .json({ message: "Insufficient balance in recharge wallet" });
    }

    // Deduct $60 from the recharge wallet and activate the user
    user.rechargeWallet -= bullPrice;
    user.isActive = true;
    // MatchingIncome(userId);
    const all_users = await User.find()
    let all_id=[];

    for(let i=0;i<all_users.length;i++){
      all_id.push(all_users[i]._id)
    } 
    console.log("alll_id--->",all_id);
    
    for(let i=0;i<all_id.length;i++){
      await calculateMatchingIncome(all_id[i])
      console.log("useraaaa===>",all_id[i])
    }
    await user.save();

    console.log(
      `Bull purchased for user: ${user.referralCode}, $60 deducted from recharge wallet`
    );
    let message = `Bull purchased successfully. $60 deducted from recharge wallet.`;

    // Profit distribution logic to uplines (5 levels)
    let profitDistribution = [
      { percentage: 10, description: "1st upline" }, // 10% for the first upline
      { percentage: 5, description: "2nd upline" }, // 5% for the second upline
      { percentage: 5, description: "3rd upline" }, // 5% for the third upline
      { percentage: 2.5, description: "4th upline" }, // 2.5% for the fourth upline
      { percentage: 2.5, description: "5th upline" }, // 2.5% for the fifth upline
    ];

    let currentUser = user;
    let levelMessages = [];

    for (let level = 0; level < profitDistribution.length; level++) {
      // Fetch the referring user (upline) based on the referralCode
      const uplineUser = await User.findOne({
        referralCode: currentUser.referredBy,
      });

      if (!uplineUser) {
        console.log(
          `No upline user found for referral code: ${currentUser.referredBy}`
        );
        levelMessages.push(`No upline found at level ${level + 1}`);
        break;
      }

      // Calculate the profit for the upline
      const profit = (bullPrice * profitDistribution[level].percentage) / 100;

      // Add the profit to the upline's earning wallet
      uplineUser.earningWallet += profit;
      await uplineUser.save();

      const uplineMessage = `${profitDistribution[level].description} (User ID: ${uplineUser._id}) received ${profit} as profit`;
      const newBotIncome = new botIncome({
        
        user: user.referralCode,
        email: user.email,
        mobileNumber: user.mobileNumber,
        activateBy: 'admin',
        package:packageData.name,
        packagePrice:packageData.price  
      });
      console.log(uplineMessage);
      levelMessages.push(uplineMessage);

      // Set the current user to the upline for the next iteration
      currentUser = uplineUser;
    }

    // Send response with success message and details of profit distribution
    res.status(200).json({
      message: message,
      profitDistributionDetails: levelMessages,
    });
  } catch (error) {
    console.error("Error in PurchaseBull function:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.myTeamMembers = async (req, res) => {
  const { id, level } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch users at the specified level
    const levelUsers = await getUsersAtLevel(
      user.referralCode,
      parseInt(level)
    );

    // Manually populate packages
    const levelUsersWithPackages = await Promise.all(
      levelUsers.map(async (teamMember) => {
        const packages = await Product.find({
          _id: { $in: teamMember.packages },
        });
        return { ...teamMember.toObject(), packages };
      })
    );

    console.log(
      `Users at level ${level} with populated packages:`,
      levelUsersWithPackages
    );

    res.status(200).json(levelUsersWithPackages);
  } catch (err) {
    console.error("Error fetching team members:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper function to get users at a specific level
const getUsersAtLevel = async (referralCode, level) => {
  let usersAtLevel = [];

  for (let i = 1; i <= level; i++) {
    if (i === 1) {
      usersAtLevel = await User.find({ referredBy: referralCode });
    } else {
      const previousLevelUsers = usersAtLevel.map((user) => user.referralCode);
      usersAtLevel = await User.find({
        referredBy: { $in: previousLevelUsers },
      });
    }
  }

  return usersAtLevel;
};

exports.getAccountDetails = async (req, res) => {
  try {
    const result = await User.findOne({ _id: req.params.userId });
    console.log("reult", result);

    const { accountNumber, ifscCode, userName, wallet } = result;
    res.status(200).send({ accountNumber, ifscCode, userName, wallet });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateAccountDetails = async (req, res) => {
  try {
    const { accountNumber, ifscCode, userName } = req.body;

    if (!accountNumber || !ifscCode || !userName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    console.log("datfatat=>");

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { accountNumber, ifscCode, userName },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Account details updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getLevelIncomeList = async (req, res) => {
  console.log(req.params.id);

  try {
    const result = await LevelIncomeTransaction.find({ user: req.params.id });
    console.log("result", result);

    res.status(200).send(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getReferralsIncomeList = async (req, res) => {
  console.log(req.params.id);

  try {
    const result = await ReferralIncomeTransaction.find({
      user: req.params.id,
    });
    console.log("result", result);

    res.status(200).send(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getWithdrawPaymentRequest = async (req, res) => {
  console.log("withdraw transaction called");

  const userId = req.params.id;
  try {
    const result = await WithdrawPaymentRequest.find({ userId });
    res.json(result);
  } catch (err) {
    console.log("Error while getting withdraw transactions:", err);
    res.status(500).send("Server Error");
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const result = await Payments.find({ userId: req.params.id });
    console.log("reult", result);

    res.status(200).send(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Use req.params.id to get the user ID
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
    console.log("error");
  }
};
