const express = require('express');
const mysql = require('mysql');
const cron = require('node-cron');

const app = express();
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'productosdb'
});

// Conexión a la base de datos
connection.connect((error) => {
  if (error) {
    console.error('Error al conectarse a la base de datos:', error);
    return;
  }
  console.log('Conexión exitosa a la base de datos');
});

// Obtener todos los productos
app.get('/productos', (req, res) => {
  const query = 'SELECT * FROM productos';
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error });
      return;
    }
    res.json(results);
  });
});

// Obtener un producto por ID
app.get('/productos/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM productos WHERE id = ?';
  connection.query(query, [id], (error, results) => {
    if (error) {
      res.status(404).json({ error });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.json(results[0]);
  });
});

// Crear un nuevo producto

app.post('/productos', (req, res) => {
    const producto = req.body;
    const query = 'INSERT INTO productos SET ?';
    connection.query(query, [producto], (error, result) => {
      if (error) {
        res.status(500).json({ error });
        return;
      }
      res.status(201).json({ id: result.insertId });
    });
  });

// Actualizar un producto existente
app.put('/productos/:id', (req, res) => {
  const id = req.params.id;
  const producto = req.body;
  const query = 'UPDATE productos SET ? WHERE id = ?';
  connection.query(query, [producto, id], (error, result) => {
    if (error) {
      res.status(404).json({ error });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.json({ mensaje: 'Producto actualizado correctamente' });
  });
});

// Eliminar un producto existente
app.delete('/productos/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM productos WHERE id = ?';
  connection.query(query, [id], (error, result) => {
    if (error) {
      res.status(404).json({ error });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.json({ mensaje:'Producto eliminado correctamente' });
});
});

app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
});
function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }
cron.schedule('5 * * * * *', ()=>{
    var res=[];
    const query = 'SELECT * FROM productos';
    connection.query(query, (error, results) => {
        if (error) {
            res.status(500).json({ error });
            return;
         }
        res = results;
        res.forEach(producto => {
            hoy = new Date();
            formatoISOFecha = hoy.getFullYear()+'-'+pad(hoy.getMonth()+1)+'-'+pad(hoy.getDate())+ 'T00' +':' + pad(0);
            hoyFecha = new Date(formatoISOFecha)
            tiempoMili = producto.fechaCad -hoyFecha
            dias = tiempoMili/1000 /60 /60 /24
            if (dias == 5) {
                console.log("El producto "+ producto.nombre+" caduca en "+dias+"dias")
            }
        });
    //console.log(res)
    });
        
});
