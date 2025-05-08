const Income = require('../models/Income');
const Expense = require('../models/Expense');
const moment = require('moment');

exports.getDashboard = async (req, res) => {
  try {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Get monthly income and expense data for the current year
    const monthlyIncomes = await Income.getMonthlySum(req.session.user.id, currentYear);
    const monthlyExpenses = await Expense.getMonthlySum(req.session.user.id, currentYear);
    
    // Get current month's start and end dates
    const startDate = moment().startOf('month').format('YYYY-MM-DD');
    const endDate = moment().endOf('month').format('YYYY-MM-DD');
    
    // Get income and expense by category for current month
    const incomeByCategory = await Income.getCategorySum(req.session.user.id, startDate, endDate);
    const expenseByCategory = await Expense.getCategorySum(req.session.user.id, startDate, endDate);
    
    // Calculate total income and expense for current month
    const totalIncome = incomeByCategory.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const totalExpense = expenseByCategory.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const balance = totalIncome - totalExpense;
    
    // Get recent transactions
    const incomes = await Income.findAll(req.session.user.id);
    const expenses = await Expense.findAll(req.session.user.id);
    
    // Combine and sort transactions
    const transactions = [...incomes.map(i => ({...i, type: 'income'})), 
                           ...expenses.map(e => ({...e, type: 'expense'}))]
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .slice(0, 5); // Get 5 most recent transactions
    
    res.render('dashboard', {
      title: 'Dashboard',
      monthlyIncomes,
      monthlyExpenses,
      incomeByCategory,
      expenseByCategory,
      totalIncome,
      totalExpense,
      balance,
      transactions,
      moment,
      currentYear
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load dashboard data');
    res.render('dashboard', {
      title: 'Dashboard',
      error: 'Failed to load dashboard data'
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    // Default to current month
    const startDate = req.query.startDate || moment().startOf('month').format('YYYY-MM-DD');
    const endDate = req.query.endDate || moment().endOf('month').format('YYYY-MM-DD');
    
    // Get income and expense by category
    const incomeByCategory = await Income.getCategorySum(req.session.user.id, startDate, endDate);
    const expenseByCategory = await Expense.getCategorySum(req.session.user.id, startDate, endDate);
    
    // Calculate totals
    const totalIncome = incomeByCategory.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const totalExpense = expenseByCategory.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const balance = totalIncome - totalExpense;
    
    res.render('reports', {
      title: 'Financial Reports',
      incomeByCategory,
      expenseByCategory,
      totalIncome,
      totalExpense,
      balance,
      startDate,
      endDate
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to generate report');
    res.redirect('/dashboard');
  }
};