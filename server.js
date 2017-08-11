const express = require('express');
require('dotenv').config()
const { Client } = require('pg');
const mustacheExpress = require('mustache-express');
const bodyparser = require('body-parser');

const app = express();

app.use(bodyparser.urlencoded({extended : false}));
app.use(express.static('public'));

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

app.get('/', (req, res) => {
  const client = new Client();

  client.connect()
    .then(() => {
        return client.query('SELECT * FROM hot_mugs');
    })
    .then((results) => {
      console.log(results.rows);
      res.render('index', results);
      client.end();
    })
});

app.get('/sassy', (req, res) => {
  const client = new Client();

  client.connect()
    .then(() => {
        return client.query('SELECT * FROM hot_mugs WHERE is_sassy = true');
    })
    .then((results) => {
      console.log(results.rows);
      res.render('sassy', results);
      client.end();
    })
});

app.get('/entry', (req, res) => {
  res.render('entry');
})

app.post('/entry', (req, res) => {
  const client = new Client();
  client.connect()
  .then(()=> {
    const sql = 'INSERT INTO hot_mugs (amazon_photo, title, price, amazon_url, is_sassy) VALUES ($1 , $2 , $3, $4, $5)';
    const params = [req.body.amazon_photo, req.body.title, req.body.price, req.body.amazon_url, req.body.is_sassy];

    return client.query(sql, params);
  })
  .then((result) => {
    client.end();
    res.redirect('/');
  })
})

//get things by id to edit by id on edit page.
app.get('/edit/:id', (req, res) => {
  console.log(req.params.id);
  const client = new Client();
  client.connect()
    .then(() => {
      const sql = 'SELECT * FROM hot_mugs WHERE item_id = $1'
      const params =[req.params.id];
      return client.query(sql, params);
    })
    .then((results) => {
      console.log(results.rows);
      res.render('edit', results.rows[0]);
      client.end();
    })
    .catch((err) => {
      console.log(err);
    })
})

//post from edit page updated entry to database.
app.post('/edit/:id', (req, res) => {
  const client = new Client();
  client.connect()
  .then(() => {
    const sql = 'UPDATE hot_mugs SET title = $1, amazon_url = $2, amazon_photo = $3, is_sassy = $4, price = $5 WHERE item_id = $6'
    const params = [req.body.title, req.body.amazon_url, req.body.amazon_photo, req.body.is_sassy, req.body.price, req.params.id];
    return client.query(sql, params);
  })
  .then((results) => {
    res.redirect('/');
    client.end();
  })
})

app.listen(process.env.PORT, function(){
  console.log(`connected on port ${process.env.PORT}.`)
});
