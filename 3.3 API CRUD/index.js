// Importación de módulos necesarios
import express from 'express';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const PORT = 3000;
dotenv.config();

// URI de conexión desde archivo .env
const uri = process.env.uri;

let db;
let usuariosCollection;

// Middleware para parsear JSON y formularios, y servir archivos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ruta principal de prueba
app.get('/', (req, res) => {
    res.send('Bienvenido a la API CRUD ');
});

// Conexión a MongoDB Atlas
MongoClient.connect(uri, { useUnifiedTopology: true })
  .then((client) => {
    console.log('Conectado a la base de datos MongoDB Atlas');
    db = client.db(); // Se conecta a la base de datos especificada en la URI
    usuariosCollection = db.collection('usuarios'); // Se asigna la colección "usuarios"

    // Inicia el servidor después de conectar con MongoDB
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
  });

// Crear nuevo usuario
app.post('/usuarios', async (req, res) => {
  try {
    const nuevoUsuario = {
      ...req.body,
      createdAt: new Date(), // Fecha de creación automática
      updatedAt: new Date(), // Fecha de última actualización automática
    };

    await usuariosCollection.insertOne(nuevoUsuario); // Inserta en la base

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      // Aquí podrías agregar datos del usuario creado si lo deseas
    });

  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// Obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await usuariosCollection.find().toArray(); // Devuelve todos los documentos
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Obtener usuario por ID
app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await usuariosCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Se elimina el campo _id si no se quiere mostrar al cliente
    const { _id, ...usuarioSinId } = usuario;

    res.status(200).json(usuarioSinId);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

// Actualizar usuario por ID
app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const actualizacion = {
      ...req.body,
      updatedAt: new Date(), // Se actualiza el timestamp automáticamente
    };

    const resultado = await usuariosCollection.updateOne(
      { _id: new ObjectId(id) }, // Filtro por ID
      { $set: actualizacion }    // Actualiza solo los campos enviados
    );

    if (resultado.matchedCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Se obtiene el usuario actualizado para retornarlo
    const usuarioActualizado = await usuariosCollection.findOne({ _id: new ObjectId(id) });
    res.status(200).json(usuarioActualizado);
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

// Eliminar usuario por ID
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const result = await usuariosCollection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});
