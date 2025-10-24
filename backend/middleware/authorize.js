// This is a "higher-order" function. It takes the allowed roles...
const authorize = (...allowedRoles) => {
  // ...and returns a middleware function
  return (req, res, next) => {
    // Check if the user's role (from the auth middleware)
    // is included in the list of allowed roles for this route
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Forbidden: You do not have permission' });
    }
    
    // If they have the role, proceed
    next();
  };
};

module.exports = authorize;