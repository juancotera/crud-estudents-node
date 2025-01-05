const express = require('express');
const cors = require('cors');
require('dotenv').config();

//importamos rutas
const studentRoutes = require('./src/routes/students');
const areaRoutes = require('./src/routes/areas');
const competencyRoutes = require('./src/routes/competencies');
const gradeRoutes = require('./src/routes/grades');

const app = express();

//Midleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//Rutas
app.use('/api/students', studentRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/competencies', competencyRoutes);
app.use('/api/grades', gradeRoutes);

//Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de registro de estudiantes'});
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    error: 'Algo salio mal!',
    message: err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});