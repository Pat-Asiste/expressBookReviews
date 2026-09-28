const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const filtradorDeLibros = (req, res, { tipoDeFiltro: queryType }) => {
    // const queryType = "author";                                  // String     : tipoDeFiltro

    const buscado = req.params[queryType]?.toLowerCase();           // String     : a consultar     // siempre valdrá true, OJO.
    const libros = Object.values(books);                            // Array[{},] : libros db2
    let filteredBooks = libros.filter((book) => (book[queryType]?.toLowerCase().includes(buscado)));
    return filteredBooks.length > 0
        ? res.status(200).json(filteredBooks)                       // Array[{},] : output
        : res.status(404).json({ message: `No hay libros para mostrar, ${queryType} no encontrado.` });
};


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        if (password.length < 8) {
            return res.status(400).json({ message: `Contraseña insegura. Incluye 8 o más caracteres.` });
        }
        if (isValid(username)) {                    // ¿es nuevo el user?
            users.push({ username, password });
            return res.status(200).json({ message: `Usuario '${username}' registrado exitosamente.` });
        }
        return res.status(409).json({ message: `El username '${username}' ya está en uso. Elija uno distinto.` })
    }
    return res.status(400).json({ message: "No ingresó el 'username' o el 'password'. Complete las credenciales e intente nuevamente." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    let filteredBook = books[req.params.isbn];
    return filteredBook
        ? res.status(200).json(filteredBook)
        : res.status(404).json({ message: `No encontrado. ISBN '${id}' inválido.` });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    filtradorDeLibros(req, res, { tipoDeFiltro: "author" });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    filtradorDeLibros(req, res, { tipoDeFiltro: "title" });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    let filteredBook = books[req.params.isbn];
    if (filteredBook) {
        return Object.values(filteredBook.reviews).length > 0
            ? res.status(200).json(filteredBook.reviews)
            : res.status(200).json({ message: `ISBN: '${req.params.isbn}'. El libro seleccionado aún no posee reviews.` });
    }
    return res.status(404).json({ message: `No encontrado. ISBN '${req.params.isbn}' inválido.` });
});

module.exports.general = public_users;
