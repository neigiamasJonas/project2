///        NAUJO REACT PROJEKTO INSTALIACIJA        ///


1. React instaliacija:

    npx create-react-app r1
    cd r1
    npm start


2. Axios + Saas + React-router-dom

    cd r1
    1. npm install axios
    2. npm install sass
    3. npm install react-router-dom@6
    4. npm i uuid (i server ir i r1) --->  import { v4 as uuidv4 } from 'uuid';


3. Server folderio instaliacija

    1. cd server (failo direktorija)
    2. npm init (susirashyt package.json info)
    3. npm install express (serveris)
    4. npm i mysql (Marija DB)
    5. npm i nodemon (nodemon)
    6. npm i cors (biblioteka, kuri sako, kad viskas yra ok narshyklej, kad ji vygdytu duota koda)
    7. npm i js-md5 (i server)
    8. npm i uuid (i server ir i r1)

    9. Nodemon paleidimas:
         i package.json "scripts" yrashiti !!! "start": "nodemon App.js"
         cd server
         npm start

    10. .gitignore(/node_modules)



4. app.js (server folderis)

const express = require("express"); 
const app = express(); 
const port = 3006; 
const cors = require("cors");

app.use(express.json({ limit: '10mb' }));     // padidintas photo upload limitas + sql confige taip pat padidintas

app.use(cors());

const mysql = require("mysql");
const md5 = require('js-md5');
const uuid = require('uuid');

app.use(

express.urlencoded({
    extended: true,
})
);

app.use(express.json());

const con = mysql.createConnection({

host: "localhost",
user: "root",
password: "",
database: "movies",
});



// galima ji deti paciam gale arba po AUTH ir login-check/login //
app.listen(port, () => {
console.log(`Alo - alo, Baločka Jonas klauso - ${port}`);
});


5. AUTHENTIFICATION

// AUTH // 
const doAuth = function(req, res, next) {
  if (0 === req.url.indexOf('/admin')) {                // admin
      const sql = `
      SELECT
      name, role
      FROM users
      WHERE session = ?
  `;
      con.query(
          sql, [req.headers['authorization'] || ''],
          (err, results) => {
              if (err) throw err;
              if (!results.length || results[0].role !== 'admin') {
                  res.status(401).send({});
                  req.connection.destroy();
              } else {
                  next();
              }
          }
      );
  } else if (0 === req.url.indexOf('/login-check') || 0 === req.url.indexOf('/login')) {      
    
    // jeigu noriu tikrint tik admin, o fronta palikti visiems, istirnti visa front dali ir vietoj else if palikti tik - else ir next
    
    ();

      next();
  } else {                                              // front
      const sql = `
      SELECT
      name, role
      FROM users
      WHERE session = ?
  `;
      con.query(
          sql, [req.headers['authorization'] || ''],
          (err, results) => {
              if (err) throw err;
              if (!results.length) {
                  res.status(401).send({});
                  req.connection.destroy();
              } else {
                  next();
              }
          }
      );
  }
}
app.use(doAuth)


6. LOGIN-CHECk + LOGIN

// login-check + login //
app.get("/login-check", (req, res) => {
  let sql;
  let requests;
  if(req.query.role === 'admin') {
    sql = `
    SELECT
    name
    FROM users
    WHERE session = ? AND role = ?
    `;
    requests =  [req.headers['authorization'] || '', req.query.role]
  } else {
      sql = `
      SELECT
      name
      FROM users
      WHERE session = ?
      `;
      requests =  [req.headers['authorization'] || '']
  }
  con.query(sql, requests, (err, result) => {   // req.query.role + AND role = ? (tik dabar ismeciau)
      if (err) throw err;
      if (!result.length) {
          res.send({ msg: 'error' });
      } else {
          res.send({ msg: 'ok' });
      }
  });
});


app.post("/login", (req, res) => {
  const key = uuid.v4();
  const sql = `
  UPDATE users
  SET session = ?
  WHERE name = ? AND pass = ?
`;
  con.query(sql, [key, req.body.user, md5(req.body.pass)], (err, result) => {
      if (err) throw err;
      if (!result.affectedRows) {
          res.send({ msg: 'error', key: '' });
      } else {
          res.send({ msg: 'ok', key });
      }
  });
});



7. BACK'as

//////////////////////////////////////////////
///////////////  BACK SHOP  //////////////////

// CREATE CAT //
app.post("/admin/categories", (req, res) => {
    const sql = `
    INSERT INTO categories
    (title)
    VALUES (?)
  `;

  con.query(sql, [req.body.title], (err, result) => {
    if (err) throw err;   
    res.send({result, msg: {text: 'New category created', type: 'success'}});
  });
});


// GET CAT //
app.get("/admin/categories", (req, res) => {
    const sql = `
    SELECT *
    FROM categories
    ORDER BY title
  `;
    con.query(sql, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  });

// DELETE CAT //
app.delete("/admin/categories/:id", (req, res) => {
  const sql = `
  DELETE FROM categories
  WHERE id = ?
`;
  con.query(sql, [req.params.id], (err, result) => {
    if (err) throw err;   
    res.send({ result, msg: { text: 'Category deleted', type: 'success' } });
  });
});

// EDIT CAT //
app.put("/admin/categories/:id", (req, res) => {
  const sql = `
  UPDATE categories
  SET title = ?
  WHERE id = ?
  `;
  con.query(sql, [req.body.title, req.params.id], (err, result) => {
      if (err) throw err;
      res.send({ result, msg: { text: 'Category updated', type: 'success' } });
    });
});


// CREATE ITEM //
app.post("/admin/items", (req, res) => {
  const sql = `
  INSERT INTO items
  (title, price, in_stock, category_id, photo)
  VALUES (?, ?, ?, ?, ?)
  `;
  con.query(sql, [req.body.title, req.body.price, req.body.inStock, req.body.cat, req.body.photo], (err, result) => {
      if (err) throw err;
      res.send({ result, msg: { text: 'New Item has been created', type: 'success' } });
  });
});


// GET ITEM //
app.get("/admin/items", (req, res) => {
  const sql = `
  SELECT i.id, price, i.title, c.title AS cat, in_stock, last_update AS lu, photo
  FROM items AS i
  LEFT JOIN categories AS c
  ON c.id = i.category_id
  ORDER BY title
  `;
  con.query(sql, (err, result) => {
      if (err) throw err;
      res.send(result);
  });
});


// DELETE ITEM //
app.delete("/admin/items/:id", (req, res) => {
  const sql = `
  DELETE FROM items
  WHERE id = ?
  `;
  con.query(sql, [req.params.id], (err, result) => {
      if (err) throw err;
      res.send({ result, msg: { text: 'Item deleted', type: 'success' } });
  });
});


// EDIT ITEM // // uzmest aki i inStock parametrus //
app.put("/admin/items/:id", (req, res) => {
  const sql = `
  UPDATE items
  SET title = ?, price = ?, last_update = ?, category_id = ?, in_stock = ?, photo = ?
  WHERE id = ?
  `;
  con.query(sql, [req.body.title, req.body.price, req.body.lu, req.body.cat, req.body.in_stock, req.body.photo, req.params.id], (err, result) => {
      if (err) throw err;
      res.send({ result, msg: { text: 'Item updated', type: 'success' } });
  });
});


// DELETE/EDIT PHOTO //
app.delete("/admin/photos/:id", (req, res) => {
  const sql = `
  UPDATE items
  SET photo = null
  WHERE id = ?
  `;
  con.query(sql, [req.params.id], (err, result) => {
      if (err) throw err;
      res.send({ result, msg: { text: 'Photo removed', type: 'success' } });
  });
});


7. FRONT'as

// // GET ITEM BE FILTRO //
// app.get("/items", (req, res) => {
//   const sql = `
//   SELECT i.id, price, i.title, c.title AS cat, in_stock, last_update AS lu, photo
//   FROM items AS i
//   LEFT JOIN categories AS c
//   ON c.id = p.category_id
//   ORDER BY title
//   `;
//   con.query(sql, (err, result) => {
//       if (err) throw err;
//       res.send(result);
//   });
// });

// GET CATS ??
app.get("/categories", (req, res) => {
  const sql = `
SELECT *
FROM categories
ORDER BY title
`;
  con.query(sql, (err, result) => {
      if (err) throw err;
      res.send(result);
  });
});

// SUDETINGAS GET ITEM VARIANTAS //
// GET ITEM //    // pakeistas del filtro // ir adinau c.id AS cid //
app.get("/items", (req, res) => {
  let sql;
  let requests;
  // console.log(req.query['cat-id']);
  if (!req.query['cat-id'] && !req.query['s']) {
      sql = `
      SELECT i.id, c.id AS cid, price, i.title, c.title AS cat, in_stock, last_update AS lu, photo
      FROM items AS i
      LEFT JOIN categories AS c
      ON c.id = p.category_id
      ORDER BY title
      `;
      requests = [];
  } else if (req.query['cat-id']){
      sql = `
      SELECT i.id, c.id AS cid, price, i.title, c.title AS cat, in_stock, last_update AS lu, photo
      FROM items AS i
      LEFT JOIN categories AS c
      ON c.id = p.category_id
      WHERE p.category_id = ?
      ORDER BY title
      `;
      requests = [req.query['cat-id']];
  } else {
      sql = `
      SELECT i.id, c.id AS cid, price, i.title, c.title AS cat, in_stock, last_update AS lu, photo
      FROM items AS i
      LEFT JOIN categories AS c
      ON c.id = p.category_id
      WHERE i.title LIKE ?
      ORDER BY title
      `;
      requests = ['%' + req.query['s'] + '%'];
  }
  con.query(sql, requests, (err, result) => {
      if (err) throw err;
      res.send(result);
  });
});



/// pasiaiskint del rating pries darant
/// rate create 'http://localhost:3004/front/balsuok/'

app.put("/front/balsuok/:treeId", (req, res) => {
  const sql = `
  UPDATE Medziai
  SET rates = rates + 1, rate_sum = rate_sum + ?
  WHERE id = ?
`;
  con.query(sql, [req.body.rate, req.params.treeId], (err, result) => {     // !!! tarp sql ir(err,result) IDEDU !!!! masyva [req.body.type, req.body.title, req.body.height]
    if (err) throw err;   
    res.send({result, msg: {text: 'Prabalsuota sekmingai', type: 'success'}});
  });
});