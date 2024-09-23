const User = require("../models/User");

exports.calculateLegBusinessPerLevel = async (userId) => {
    // Step 1: Fetch the user by userId
    const user = await User.findById(userId);
    
    if (!user) {
        console.log("User not found");
        return [];
    }

    // Step 2: Fetch all direct downline users (referred by the current user)
    const directDownlineUsers = await User.find({ referredBy: user.referralCode });

    if (directDownlineUsers.length === 0) {
        console.log("No direct downline users found.");
        return [];
    }

    const levelsData = {}; // Object to store users grouped by levels
    const allProcessedUsers = new Set(); // To avoid duplication of users across levels
    let currentLevelUsers = directDownlineUsers; // Start with direct downlines
    let currentLevel = 1;

    // Step 3: Process each level
    while (currentLevelUsers.length > 0) {
        levelsData[currentLevel] = []; // Initialize the current level

        const nextLevelUsers = []; // To store users of the next level

        for (const downlineUser of currentLevelUsers) {
            // Check if the user is already processed
            if (allProcessedUsers.has(downlineUser._id.toString())) {
                continue; // Skip if already processed
            }

            // Add current user to the level and mark them as processed
            levelsData[currentLevel].push(downlineUser);
            allProcessedUsers.add(downlineUser._id.toString());

            // Find the downline users of the current user (for the next level)
            const userDownline = await User.find({ referredBy: downlineUser.referralCode });
            nextLevelUsers.push(...userDownline); // Add them to the next level
        }

        // Move to the next level
        currentLevelUsers = nextLevelUsers;
        currentLevel++;
    }

    // Step 4: Calculate business, power leg, and single leg for each level
    const result = [];

    for (const [level, users] of Object.entries(levelsData)) {
        const businessArray = users.map(u => u.business || 0); // Extract business values for users in this level

        const totalBusiness = businessArray.reduce((acc, num) => acc + num, 0); // Total business for the level
        const maxBusiness = Math.max(...businessArray); // Maximum business (potential power leg)
        let powerLeg = 0;

        // Find the power leg using the same condition
        for (let num of businessArray) {
            if (num > totalBusiness - num) {
                powerLeg = num;
                break;
            }
        }

        if (powerLeg === 0) {
            powerLeg = maxBusiness; // If no leg exceeds the remaining business, the largest is the power leg
        }

        const singleLeg = totalBusiness - powerLeg; // Calculate single leg as the remaining business

        // Push the result for this level
        result.push({
            level: Number(level), // Ensure level is a number
            totalMembers: users.length, // Total number of users in this level
            totalBusiness, // Total business for this level
            powerLeg, // Power leg for this level
            singleLeg, // Single leg for this level
        });
    }

    // Step 5: Return the final result
    return result;
};
