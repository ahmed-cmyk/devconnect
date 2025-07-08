import dotenv from 'dotenv';
dotenv.config({ path: '.env.example' });

// Set a default JWT_SECRET for testing if not already set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';