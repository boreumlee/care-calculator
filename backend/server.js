import express from 'express';
import cors from 'cors';
import clientRouter from './routes/client.js';
import institutionRouter from './routes/institution.js';
import simulatorRouter from './routes/simulator.js';

const app = express();
const PORT = process.env.PORT || 4000;

// 미들웨어 세팅
app.use(cors());
app.use(express.json());

// 라우터 연결
app.use('/api/v1/client', clientRouter);
app.use('/api/v1/institution', institutionRouter);
app.use('/api/v1/simulator', simulatorRouter);

app.get('/', (req, res) => {
  res.send('Care Calculator Backend API Server is Running');
});

app.listen(PORT, () => {
  console.log(`🚀 Care Calculator Backend Server running on port ${PORT}`);
});
