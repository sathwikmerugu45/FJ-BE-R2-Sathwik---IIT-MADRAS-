const Income = require('../models/Income');
const moment = require('moment');

exports.getIncomes = async (req, res) => {
  try {
    const incomes = await Income.findAll(req.session.user.id);
    res.render('income/list', {
      title: 'Income',
      incomes,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load income data');
    res.redirect('/dashboard');
  }
};

exports.renderAddIncome = async (req, res) => {
  try {
    const categories = await Income.getCategories(req.session.user.id);
    res.render('income/add', {
      title: 'Add Income',
      categories
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load income form');
    res.redirect('/income');
  }
};

exports.addIncome = async (req, res) => {
  try {
    const { category_id, amount, description, date } = req.body;
    const errors = [];

    // Validate input
    if (!category_id || !amount || !date) {
      errors.push({ msg: 'Please fill in all required fields' });
    }
    
    if (errors.length > 0) {
      const categories = await Income.getCategories(req.session.user.id);
      return res.render('income/add', {
        title: 'Add Income',
        errors,
        categories,
        category_id,
        amount,
        description,
        date
      });
    }

    await Income.create({
      user_id: req.session.user.id,
      category_id,
      amount,
      description: description || '',
      date
    });

    req.flash('success_msg', 'Income added successfully');
    res.redirect('/income');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to add income');
    res.redirect('/income/add');
  }
};

exports.renderEditIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id, req.session.user.id);
    
    if (!income) {
      req.flash('error_msg', 'Income not found');
      return res.redirect('/income');
    }
    
    const categories = await Income.getCategories(req.session.user.id);
    
    res.render('income/edit', {
      title: 'Edit Income',
      income,
      categories,
      formattedDate: moment(income.date).format('YYYY-MM-DD')
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load income');
    res.redirect('/income');
  }
};

exports.updateIncome = async (req, res) => {
  try {
    const { category_id, amount, description, date } = req.body;
    
    await Income.update(req.params.id, {
      category_id,
      amount,
      description: description || '',
      date
    }, req.session.user.id);

    req.flash('success_msg', 'Income updated successfully');
    res.redirect('/income');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update income');
    res.redirect(`/income/edit/${req.params.id}`);
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    await Income.delete(req.params.id, req.session.user.id);
    req.flash('success_msg', 'Income deleted successfully');
    res.redirect('/income');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to delete income');
    res.redirect('/income');
  }
};

exports.renderAddCategory = (req, res) => {
  res.render('income/add-category', {
    title: 'Add Income Category'
  });
};

exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      req.flash('error_msg', 'Category name is required');
      return res.redirect('/income/categories/add');
    }
    
    await Income.createCategory(name, req.session.user.id);
    
    req.flash('success_msg', 'Category added successfully');
    res.redirect('/income/add');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to add category');
    res.redirect('/income/categories/add');
  }
};