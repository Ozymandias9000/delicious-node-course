const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Failed Login!',
	successRedirect: '/',
	successFlash: 'You are now logged in!'
});

exports.logout = (req,res) => {
	req.logout();
	req.flash('success', 'You are now logged out!');
	res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
	// check if user is authenticated
	if(req.isAuthenticated()) {
		next(); // logged in
		return;
	}
	req.flash('error', 'Oops! You must be logged in!');
	res.redirect('/login');
}

exports.forgot = async (req, res) => {
	// 1. see if user exists
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		req.flash('error', 'A password reset has been mailed to you.')
		return res.redirect('/login');
	}
	// 2. set reset tokens and expiry on account
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 3600000;
	await user.save();
	// 3. send email with token
	const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
	req.flash('success', `You have been emailed a password reset link. ${resetURL}`);
	// 4. finally redirect to login
	res.redirect('/login');
}
