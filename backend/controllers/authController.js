import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.create({ email, password });

        res.status(201).json({
            status: 'success',
            message: 'Account created successfully'
        });

    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) return next(new Error('Invalid credentials', 401));

        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) return next(new Error('Invalid credentials', 401));

        res.status(200).json({
            status: 'success',
            message: 'Login successful'
        });

    } catch (err) {
        next(err);
    }
};