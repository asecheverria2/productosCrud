const express = require('express');
const mysql = require('mysql');
const cron = require('node-cron');

const accountSid = 'ACbda70f08f4a8ee692669aec9f7de77f8';
const authToken = '4e5224f7f816f4e42d4ce57cb0529cd8';
const client = require('twilio')(accountSid, authToken);

const nodemailer = require('nodemailer');

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
var cors = require('cors')

app.use(cors()) 

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

//funcion de nodemailer
enviar_mail = (mensaje) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'perugachisebastian63@gmail.com',
            pass: 'xrkopnrmqvjbmnlz'
        }
    });
    let mail_options = {
        from: '"NProductos" <perugachisebastian63@gmail.co>',
        to: 'echeverriapas@gmail.com',
        subject: 'Informacion de Caducidad de producto',
        html: `
            <table border="0" cellpadding="0" cellspacing="0" width="600px" background-color="#2d3436" bgcolor="#2d3436">
                <tr height="200px">  
                    <td bgcolor="" width="600px">
                        <h1 style="color: #fff; text-align:center">Bienvenido</h1>
                        <p  style="color: #fff; text-align:center">
                            <span style="color: #e84393">${mensaje}</span> 
                        </p>
                    </td>
                </tr>
                <tr bgcolor="#fff">
                    <td style="text-align:center">
                        <p style="color: #000">¡Un mundo de servicios a su disposición!</p>
                    </td>
                </tr>
            </table>
        `
    };
    transporter.sendMail(mail_options, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('El correo se envío correctamente ' + info.response);
        }
    });
};


//funcion para agregar 0 a un numero menor a 10
function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }

//funcion para automatizar el envio de mensajes'5 * * * * *''0 8 * * 0-6'
cron.schedule('0 8 * * 0-6', ()=>{
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
            fechaCad = new Date(producto.fechaCad+'T00' +':' + pad(0))
            console.log(fechaCad)
            console.log(hoyFecha)
            tiempoMili = fechaCad -hoyFecha
            dias = tiempoMili/1000 /60 /60 /24
            console.log(dias)
            if (dias == 5) {
                mensaje = "El producto "+ producto.nombre+" caduca en "+dias+" dias"
                console.log(mensaje)
                enviar_mail(mensaje);
                //creacion de mensaje para whatsapp
                client.messages.create({
                    from: 'whatsapp:+14155238886',
                    body: mensaje,
                    to: 'whatsapp:+593998414714'
                  }).then(message => console.log(message.sid));
            }
        });
    //console.log(res)
    });
        
});
