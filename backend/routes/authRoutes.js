import express from 'express';
import { check } from 'express-validator';
import { signup, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', [
    check('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    check('confirmPassword')
        .exists().withMessage('Confirm password is required')
        .custom((value, { req }) => value === req.body.password).withMessage('Passwords must match')
], signup);

router.post('/login', [
    check('email').isEmail().withMessage('Valid email required'),
    check('password')
        .exists().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], login);

export default router;
