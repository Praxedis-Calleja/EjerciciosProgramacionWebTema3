import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Usuario from './models/usuario.model.js';

const app = express();
const PORT = 3000;
dotenv.config();

const uri = process.env.uri;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.send('Bienvenido a la API CRUD ');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    });

    mongoose.connect(uri)
    .then(() => {
        console.log('Conectado a la base de datos MongoDB');
    }).catch((error) => {
        console.error('Error al conectar a la base de datos:', error);
    });

app.post('/usuarios', async (req, res) => {
  try {
    const usuario = await Usuario.create(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});


app.get("/usuarios", async (req, res) => {	
  try {
    const usuarios = await Usuario.find();
    res.status(200).json(usuarios);
    
  } catch (error) {
    console.error('Error al obtener los usiuarios:', error);
    res.status(500).json({error: 'Error al obtener los usiarios'});
    
  }
})

app.get("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    res.status(200).json(usuario);
  } catch (error) {
     console.error('Error al obtener el id:', error);
    res.status(500).json({error: 'Error al obtener al id'});
  }
})

app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByIdAndUpdate(id, req.body);
    if(!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const usuarioActualizado = await Usuario.findById(id);
    res.status(200).json(usuarioActualizado);
    console.log(usuarioActualizado);

  } catch (error) {
    console.error('Error al obtener el id:', error);
    res.status(500).json({error: 'Error al obtener al id'});
  }
})
app.delete("/usuarios/:id", async (req, res) => {
try {
    const {id}= req.params;
  const usuario = await Usuario.findByIdAndDelete(id);
  if(!usuario){
    return res.status(400).json({error: 'Usuario no encontrado'});
  }
  res.status(200).json({message: 'Usuario eliminado'});
} catch (error) {
  console.error('Error al eliminar el usuario:', error);
  res.status(500).json({error: 'Error al eliminar el usuario'});
}
})