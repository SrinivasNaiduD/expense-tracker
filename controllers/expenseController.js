const Expense = require("../models/Expense");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const mongoose = require("mongoose");
// exports.createExpense = async (req, res) => {
//   try {
//     const { title, amount, date, category, note } = req.body;

//     const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

//     const expense = await Expense.create({
//       title,
//       amount,
//       date,
//       category,
//       note,
//       imageUrl,
//       user: req.user.userId,
//     });

//     // 🔔 Monthly Expense Alert (Email Notification)
//     const start = new Date(
//       new Date(date).getFullYear(),
//       new Date(date).getMonth(),
//       1
//     );
//     const end = new Date(
//       new Date(date).getFullYear(),
//       new Date(date).getMonth() + 1,
//       0
//     );

//     const totalThisMonth = await Expense.aggregate([
//       {
//         $match: {
//           user: req.user.userId,
//           date: { $gte: start, $lte: end },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: "$amount" },
//         },
//       },
//     ]);

//     const threshold = parseFloat(process.env.EXPENSE_ALERT_LIMIT || "0");
//     console.log(`🧮 Total this month: ₹${totalThisMonth[0]?.total}`);
//     if (totalThisMonth[0]?.total > threshold) {
//       const user = await User.findById(req.user.userId);
//       console.log("🚨 Threshold exceeded. Sending email...");
//       sendEmail(
//         user.email,
//         "Expense Limit Alert",
//         `Hi ${user.email}, you have crossed ₹${threshold} in expenses this month.`
//       );
//     }

//     res.status(201).json(expense);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, date, category, note } = req.body;

    // Upload image if exists
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Save expense
    const expense = await Expense.create({
      title,
      amount,
      date,
      category,
      note,
      imageUrl,
      user: req.user.userId,
    });

    // Determine start and end of current month
    const start = new Date(
      new Date(date).getFullYear(),
      new Date(date).getMonth(),
      1
    );
    const end = new Date(
      new Date(date).getFullYear(),
      new Date(date).getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    console.log("Start:", start.toISOString());
    console.log("End:", end.toISOString());

    // Aggregate total expenses this month for the user
    const totalThisMonth = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.userId),
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const threshold = parseFloat(process.env.EXPENSE_ALERT_LIMIT || "0");
    const total = totalThisMonth[0]?.total || 0;

    console.log(`Total this month: ₹${total}`);

    // Send email if threshold is crossed
    if (total > threshold) {
      const user = await User.findById(req.user.userId);
      await sendEmail(
        user.email,
        "🚨 Expense Limit Alert",
        `Hi ${user.email}, you have crossed ₹${threshold} in expenses this month.\n\nCurrent total: ₹${total}`
      );
    }

    res.status(201).json(expense);
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(500).json({ message: err.message });
  }
};
exports.getExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      sortBy = "date",
      sortOrder = "desc",
      date: filterDate,
    } = req.query;
    const query = { user: req.user.userId };
    if (category) query.category = category;
    if (filterDate) query.date = new Date(filterDate);

    const expenses = await Expense.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const update = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      update,
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Optionally delete image file
    if (expense.imageUrl) {
      const imagePath = path.join(__dirname, "..", expense.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Failed to delete image:", err);
      });
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
