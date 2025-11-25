const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("./db.js");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());


const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};


app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        
        const hashed = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO users(name, email, password) VALUES (?, ?, ?)",
            [name, email, hashed]
        );

        return res.json({ success: true, message: "Registration successful" });

    } catch (err) {
        console.error("Error:", err);
        return res.json({ success: false, message: "Failed to register" });
    }
});


app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        const user = rows[0];

       
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Wrong password" });
        }

        
        const token = generateToken(user);

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error("Error:", err);
        return res.json({ success: false, message: "Failed to login" });
    }
});

app.put("/update", verifyToken, async (req, res) => {
    const userId = req.user.id;  
    const { name, email } = req.body;

    try {
        await db.query(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            [name, email, userId]
        );

        res.json({
            success: true,
            message: "Profile updated",
        });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Update failed" });
    }
});



app.post("/tasks", verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { title, description } = req.body;

    try {
        await db.query(
            "INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)",
            [userId, title, description]
        );

        res.json({ success: true, message: "Task created" });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Failed to create task" });
    }
});

app.get("/get_tasks", verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [tasks] = await db.query(
            "SELECT * FROM tasks WHERE user_id = ?",
            [userId]
        );

        res.json({ success: true, tasks });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Failed to fetch tasks" });
    }
});


app.get("/tasks", verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [tasks] = await db.query(
            "SELECT * FROM tasks WHERE user_id = ?",
            [userId]
        );

        res.json({ success: true, tasks });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Failed to fetch tasks" });
    }
});

app.put("/tasks/:id", verifyToken, async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, description } = req.body;

    try {
        await db.query(
            "UPDATE tasks SET title = ?, description = ? WHERE id = ? AND user_id = ?",
            [title, description, taskId, userId]
        );

        res.json({ success: true, message: "Task updated" });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Failed to update task" });
    }
});

app.delete("/tasks/:id", verifyToken, async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;

    try {
        await db.query(
            "DELETE FROM tasks WHERE id = ? AND user_id = ?",
            [taskId, userId]
        );

        res.json({ success: true, message: "Task deleted" });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Failed to delete task" });
    }
});




function verifyToken(req, res, next) {
    const token = req.headers["authorization"];

    if (!token)
        return res.status(401).json({ message: "Access denied, token missing" });

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = decoded; // store user data
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
}


app.get("/profile", verifyToken, (req, res) => {
    res.json({
        message: "Valid token - profile data",
        user: req.user
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
