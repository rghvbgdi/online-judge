const crypto = require('crypto');
const user = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Utility function to check password strength
function isStrongPassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(password);
}

exports.register = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        if (!(firstname && lastname && email && password)) {
            return res.status(400).send("Please enter all the information");
        }

        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        if (!isStrongPassword(password)) {
            return res.status(400).send("Password must be at least 6 characters long and include at least one uppercase letter and one number.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newuser = await user.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role: "user"
        });

        const token = jwt.sign({ id: newuser._id, email, role: newuser.role }, process.env.SECRET_KEY,
            { expiresIn: '24h' } // Align with login expiration
        );

        // Set the token in an HttpOnly cookie, same as in login
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        newuser.password = undefined;

        res.status(200).json({ message: 'You have successfully registered!', user: newuser });

    } catch (error) {
        console.error("Register route error:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            return res.status(400).send("Please enter all the information");
        }

        const existingUser = await user.findOne({ email });
        if (!existingUser) {
            return res.status(404).send("User not found");
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(401).send("Invalid credentials");
        }

        const token = jwt.sign(
            {
                id: existingUser._id,
                email: existingUser.email,
                role: existingUser.role,
            },
            process.env.SECRET_KEY,
            { expiresIn: "24h" }
        );

    // Set the token in an HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true, // Not accessible via client-side JavaScript
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'lax', // Helps mitigate CSRF attacks
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

        res.status(200).json({
            message: "You have successfully logged in!",
            user: {
                id: existingUser._id,
                firstname: existingUser.firstname,
                lastname: existingUser.lastname,
                email: existingUser.email,
                role: existingUser.role,
            },
        });
    } catch (error) {
        console.error("Login route error:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};

// Logout route - clears the authentication cookie
exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    try {
        const existingUser = await user.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found." });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        existingUser.resetToken = resetToken;
        existingUser.resetTokenExpiry = resetTokenExpiry;
        await existingUser.save();

        // TODO: Send this resetToken in a real email
        res.status(200).json({ message: "Reset link sent to email.", token: resetToken });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: "Token and new password are required." });
    }

    try {
        const existingUser = await user.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!existingUser) {
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({ message: "Password must be at least 6 characters long and include at least one uppercase letter and one number." });
        }

        existingUser.password = await bcrypt.hash(password, 10);
        existingUser.resetToken = undefined;
        existingUser.resetTokenExpiry = undefined;
        await existingUser.save();

        res.status(200).json({ message: "Password has been reset successfully." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};