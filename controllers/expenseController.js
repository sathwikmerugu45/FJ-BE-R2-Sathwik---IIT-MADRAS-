const Expense = require('../models/Expense');
const moment = require('moment');

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll(req.session.user.id);
    res.render('expenses/list', {
      title: 'Expenses',
      expenses,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load expenses');
    res.redirect('/dashboard');
  }
};

exports.renderAddExpense = async (req, res) => {
  try {
    const categories = await Expense.getCategories(req.session.user.id);
    res.render('expenses/add', {
      title: 'Add Expense',
      categories
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load expense form');
    res.redirect('/expenses');
  }
};

exports.addExpense = async (req, res) => {
  try {
    const { category_id, amount, description, date } = req.body;
    const errors = [];

    // Validate input
    if (!category_id || !amount || !date) {
      errors.push({ msg: 'Please fill in all required fields' });
    }

    if (errors.length > 0) {
      const categories = await Expense.getCategories(req.session.user.id);
      return res.render('expenses/add', {
        title: 'Add Expense',
        errors,
        categories,
        category_id,
        amount,
        description,
        date
      });
    }

    await Expense.create({
      user_id: req.session.user.id,
      category_id,
      amount,
      description: description || '',
      date
    });

    req.flash('success_msg', 'Expense added successfully');
    res.redirect('/expenses');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to add expense');
    res.redirect('/expenses/add');
  }
};

exports.renderEditExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id, req.session.user.id);
    
    if (!expense) {
      req.flash('error_msg', 'Expense not found');
      return res.redirect('/expenses');
    }
    
    const categories = await Expense.getCategories(req.session.user.id);
    
    res.render('expenses/edit', {
      title: 'Edit Expense',
      expense,
      categories,
      formattedDate: moment(expense.date).format('YYYY-MM-DD')
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load expense');
    res.redirect('/expenses');
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { category_id, amount, description, date } = req.body;
    
    await Expense.update(req.params.id, {
      category_id,
      amount,
      description: description || '',
      date
    }, req.session.user.id);

    req.flash('success_msg', 'Expense updated successfully');
    res.redirect('/expenses');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update expense');
    res.redirect(`/expenses/edit/${req.params.id}`);
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    await Expense.delete(req.params.id, req.session.user.id);
    req.flash('success_msg', 'Expense deleted successfully');
    res.redirect('/expenses');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to delete expense');
    res.redirect('/expenses');
  }
};

exports.renderAddCategory = (req, res) => {
  res.render('expenses/add-category', {
    title: 'Add Expense Category'
  });
};

exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      req.flash('error_msg', 'Category name is required');
      return res.redirect('/expenses/categories/add');
    }
    
    await Expense.createCategory(name, req.session.user.id);
    
    req.flash('success_msg', 'Category added successfully');
    res.redirect('/expenses/add');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to add category');
    res.redirect('/expenses/categories/add');
  }
};