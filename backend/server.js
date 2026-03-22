import express from 'express';
import cors from 'cors';
import intentRoutes from './routes/intentRoutes.js';
import personaRoutes from './routes/personaRoutes.js';
import geocodeRoutes from './routes/geocodeRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import { sessionMiddleware } from './middlewares/sessionMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * ============================================
 * MIDDLEWARE
 * ============================================
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'https://hitch-pool.vercel.app/',
}))

app.get('/', (req, res) => {
    res.json({
        "message": 'Welcome to HitchPool API',
    });
})

app.use('/api', sessionMiddleware);
app.use('/api/intent', intentRoutes);
app.use('/api/persona', personaRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/route', routeRoutes);

/**
 * ============================================
 * ERROR HANDLING MIDDLEWARE
 * ============================================
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong',
        message: err.message,
    });
});

/**
 * ============================================
 * START SERVER
 * ============================================
 */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;