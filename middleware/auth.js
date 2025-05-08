module.exports = {
    // Check if user is authenticated
    ensureAuthenticated: (req, res, next) => {
      if (req.session.user) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view this resource');
      res.redirect('/login');
    },
    
    // Check if user is not authenticated
    ensureNotAuthenticated: (req, res, next) => {
      if (!req.session.user) {
        return next();
      }
      res.redirect('/dashboard');
    }
  };