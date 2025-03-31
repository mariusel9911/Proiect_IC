import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import specs from './config/swagger.js';
import cookieParser from 'cookie-parser';

import { config } from 'dotenv';
import { connectDB } from "./mongodb/connectDB.js";

import { authRoutes } from "./routes/auth/auth.routes.js"


// Load .env environment
config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({origin: "http://localhost:5173", credentials: true}));
app.use(express.json()); // allow us to parse incoming requests:req.body
app.use(cookieParser()); // allow us to parse incoming cookies

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


// Root route
app.get("/", (req, res) => {
    res.send("Hello app!");
});

app.use("/api/auth", authRoutes);

// Error handler (MUST come after all routes)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server error!');
});


app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});
