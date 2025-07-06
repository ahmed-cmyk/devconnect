import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const port = 8000;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.send("Works fine!");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Backend is listening on http://0.0.0.0:${port}`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
});
