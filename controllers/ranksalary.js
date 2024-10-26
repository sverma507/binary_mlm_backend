const cron = require("node-cron");
const User = require("../models/User"); // Adjust path as needed

const incomeRequirements = [
    { rank: "Alpha", weeks: 5, amount: 5, requiredUsers: 5 },
    { rank: "Beta", weeks: 5, amount: 10, requiredUsers: 10 },
    { rank: "Gamma", weeks: 5, amount: 20, requiredUsers: 20 },
    { rank: "Delta", weeks: 5, amount: 30, requiredUsers: 50 },
    { rank: "Zita", weeks: 5, amount: 60, requiredUsers: 100 },
    { rank: "Bravo", weeks: 5, amount: 150, requiredUsers: 250 },
    { rank: "Shark", weeks: 5, amount: 300, requiredUsers: 500 },
    { rank: "Titan", weeks: 5, amount: 600, requiredUsers: 1000 },
    { rank: "Unicorn", weeks: 5, amount: 1500, requiredUsers: 2500 },
    { rank: "Oscar", weeks: 5, amount: 3000, requiredUsers: 5000 },
    { rank: "Millioner", weeks: 5, amount: 4500, requiredUsers: 7500 },
    { rank: "Billioner", weeks: 5, amount: 6000, requiredUsers: 10000 },
    { rank: "Ruby", weeks: 5, amount: 9000, requiredUsers: 15000 },
    { rank: "Dioamound", weeks: 5, amount: 15000, requiredUsers: 25000 },
    { rank: "Omicron", weeks: 5, amount: 30000, requiredUsers: 50000 },
    { rank: "President", weeks: 5, amount: 60000, requiredUsers: 100000 },
];

// Daily job to check and start salary if conditions are met
exports.CalculateRankSalary = async () => {
  console.log("Running daily check to activate new ranks...");
  const users = await User.find({ isActive: true });

  for (const user of users) {
    const matchedPairsCount = user.matchedPairs.length;

    incomeRequirements.forEach((requirement, index) => {
      const { rank, requiredUsers, amount } = requirement;

      if (
        matchedPairsCount >= requiredUsers &&
        !user.rankSalaryActivation[index]
      ) {
        user.rankSalaryActivation[index] = true;
        user.rankSalaryStartDate[index] = new Date();
        user.salaryIncome += amount;
        user.earningWallet += amount;  // Initial salary payment
        console.log(`Activated ${rank} income for user ${user.userName}`);
      }
    });

    await user.save();
  }
}

// Weekly job to process payments for active ranks
exports.DistributeRankSalary = async () => {
  console.log("Running weekly salary payments...");
  const users = await User.find({ isActive: true });

  for (const user of users) {
    incomeRequirements.forEach((requirement, index) => {
      const { rank, weeks, amount } = requirement;

      if (user.rankSalaryActivation[index]) {
        const startDate = new Date(user.rankSalaryStartDate[index]);
        const weeksPassed = Math.floor(
          (Date.now() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );

        if (weeksPassed < weeks) {
          user.salaryIncome += amount;
          user.earningWallet += amount;
          console.log(`Paying ${amount} for ${rank} to user ${user.userName}`);
        } else {
          user.rankSalaryActivation[index] = false;  // End of 5-week period
          console.log(`Completed ${rank} income for user ${user.userName}`);
        }
      }
    });

    await user.save();
  }
}




