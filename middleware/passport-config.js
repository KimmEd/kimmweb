import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';

function initialize(passport, getUserByEmail) {
	const authenticateUser = async (email, password, done) => {
		try {
			const user = await getUserByEmail( email );
			if (user == null) {
				return done(null, false, { message: 'No user with that email' });
			}
			if (!(await bcrypt.compare(password, user.password))) {
				return done(null, false, { message: 'Wrong password' });
			}
			return done(null, user);
		} catch (err) {
			return done(err);
		}
		//   const user = User.findOne({ email: email });
		//     if (user) {
	};
	passport.use(new Strategy({ usernameField: 'email' }, authenticateUser));
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});
	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});
}

export default initialize;
