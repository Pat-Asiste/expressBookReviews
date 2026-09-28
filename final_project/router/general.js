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
    //Write your code here
    return res.status(300).json({ message: "Yet to be implemented" });
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
    //Write your code here
    return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.general = public_users;
