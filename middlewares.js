module.exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) return next();
    res.redirect('/login'); // agar user login nahi hai to login page
}
