import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import { upsertStreamUser } from "../lib/stream.js";

export async function signup(req, res) {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const idx = Math.floor(Math.random() * 100) + 1;

        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            password,
            fullName,
            profilePic: randomAvatar,
        });

        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });
            console.log(`Stream user created for this new use ${newUser.fullName}`);
        } catch (error) {
            console.log("Error creating stream user:", error);
        }

        const token = jwt.sign({ userId: newUser._id }, ENV.JWT_SECRET_KEY, {
            expiresIn: "7d",
        });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: ENV.NODE_ENV === "production",
        });

        res.status(201).json({ success: true, user: newUser })

    } catch (error) {
        console.log("Error in signup controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordCorrect = await user.matchPassword(password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user._id }, ENV.JWT_SECRET_KEY, {
            expiresIn: "7d",
        });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: ENV.NODE_ENV === "production",
        });

        res.status(200).json({ success: true, user });

    } catch (error) {
        console.log("Error in login controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export function logout(req, res) {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logout successfully" })
};

export async function onboarding(req, res) {
    try {
        const userId = req.user._id;

        const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true,
        }, { new: true })

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || "",
            });
            console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
        } catch (error) {
            console.log("Error creating stream user:", error);
        }

        res.status(200).json({ success: true, user: updatedUser });

    } catch (error) {
        console.log("Onboarding error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}