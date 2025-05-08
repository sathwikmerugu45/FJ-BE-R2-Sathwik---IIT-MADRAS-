const User = require('../models/User');

exports.renderRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Register'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, password2 } = req.body;
    const errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 6) {
      errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
      return res.render('auth/register', {
        title: 'Register',
        errors,
        name,
        email
      });
    }

    // Create user
    const user = await User.create({ name, email, password });
    
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    if (err.message === 'User already exists') {
      req.flash('error_msg', 'Email is already registered');
      return res.render('auth/register', {
        title: 'Register',
        name: req.body.name,
        email: req.body.email
      });
    }
    req.flash('error_msg', 'Server error');
    res.redirect('/register');
  }
};

exports.renderLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login'
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check for user
    const user = await User.findByEmail(email);
    if (!user) {
      req.flash('error_msg', 'Invalid email or password');
      return res.render('auth/login', {
        title: 'Login',
        email
      });
    }

    // Check password
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password');
      return res.render('auth/login', {
        title: 'Login',
        email
      });
    }

    // Store user in session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };
    
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error');
    res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('auth/profile', {
      title: 'Profile',
      user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load profile');
    res.redirect('/dashboard');
  }
};