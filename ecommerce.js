// Importazione dei moduli express e mysql2 
const express = require('express');
const mysql = require('mysql2');
const app = express();

app.set('views', './views');  // Directory dei file Pug
app.set('view engine', 'pug'); // Imposta Pug come motore di template 

// Middleware per il parsing dei dati del form
app.use(express.urlencoded({ extended: true }));

// Configurazione della connessione a MySQL
const conn = mysql.createConnection({
    host: 'localhost',    // indirizzo del server MySQL
    user: 'root',           // utente del database
    password: 'password',  // password dell'utente
    database: 'ecommerce'  /// nome del database 
});

// Connessione a MySQL
conn.connect((err) => {
    if (err) throw err; // gestisce eventuali errori
    console.log('Connesso al database MySQL!');
});

// Rotta per visualizzare la home e i prodotti
app.get('/', function (req, res) {
    // Query per selezionare tutti i prodotti
    conn.query("SELECT * FROM prodotto", function (err, result) {
        if (err) throw err;
        console.log(result); // Log dei risultati
        res.render('store', { lista: result }); // Renderizza la vista store.pug
    });
});

// Rotta per gestire gli acquisti
app.post("/buy", function(req, res) {
    let num = req.body.num; // array delle quantità
    let prodottiSelezionati = []; // array per salvare i prodotti selezionati
    let totale = 0; // variabile per il totale

    // Preleva i prodotti e calcola il totale
    for (let i = 0; i < num.length; i++) {
        if (num[i] != 0) {
            conn.query("SELECT * FROM prodotto WHERE id = ?", [i + 1], (err, results) => {
                if (err) throw err;
                const prodotto = results[0];
                const quantita = parseInt(num[i]);
                const prezzoTotale = prodotto.prezzo * quantita;

                // Aggiungi il prodotto selezionato e il suo totale all'array
                prodottiSelezionati.push({
                    nome: prodotto.nome,
                    marca: prodotto.marca,
                    prezzo: prodotto.prezzo,
                    quantita: quantita,
                    url: prodotto.url,
                    totale: prezzoTotale
                });

                // Aggiorna il totale
                totale += prezzoTotale;

                // Quando hai finito di iterare sui prodotti, rendi la vista
                if (i === num.length - 1) {
                    res.render('recapOrdine', { prodotti: prodottiSelezionati, totale });
                }
            });
        }
    }
});

// Rotta per visualizzare la pagina del gestore prodotti
app.get('/gestore', (req, res) => {
    res.render('gestore'); // Rende la vista gestore.pug
});

// Rotta POST per aggiungere un prodotto
app.post('/addProduct', (req, res) => { 
    let nome = req.body.nome; 
    let marca = req.body.marca; 
    let url = req.body.url; 
    let prezzo = parseInt(req.body.prezzo); 
    const sql = 'INSERT INTO prodotto (nome, marca, url, prezzo) VALUES (?, ?, ?, ?)';

    conn.query(sql, [nome, marca, url, prezzo], (err, result) => {
        if (err) throw err; // Gestione degli errori
        console.log("1 record inserito");
        res.render('prodAggiunto', { prodotto: { nome, marca, url, prezzo } }); // Renderizza la pagina di conferma
    });
});

// Rotta per eliminare un prodotto
app.post('/eliminaProdotto', (req, res) => {
    let nome = req.body.nome; // Estrae il nome del prodotto dal form
    console.log(nome);
    const sql = 'DELETE FROM prodotto WHERE nome = ?'; // Query SQL per eliminare il prodotto
    conn.query(sql, [nome], (err, result) => {
        if (err) throw err; // Gestione degli errori
        res.send('Prodotto eliminato con successo!'); // Risposta di conferma
    });
});

// Rotta per cercare un prodotto per marca e renderizzare la pagina con i risultati
app.post('/cercaMarca', (req, res) => {
    let marca = req.body.marca;
    const sql = 'SELECT * FROM prodotto WHERE marca = ?';
    conn.query(sql, [marca], (err, results) => {
        if (err) throw err;
        res.render('stampaMarche', { products: results, marca });
    });
});

// Avvio del server
app.listen(3000, () => {
    console.log('Server avviato su http://localhost:3000');
});
