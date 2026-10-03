const express = require('express');
const public_users = express.Router();

// db2
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;

const doesUserExist = require("./auth_users.js").doesUserExist;

function getDB2() {
    return new Promise((resolve, reject) => {                               // new Promise -- el closure evita: 'error' && 'global scope' al iniciar el servidor :) .
        setTimeout(() => {
            if (books) { resolve(books) }
            else { reject("Error conectando con la base de datos."); };
        }, 1000);
    })
}

function getArrayDB2() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books) { resolve(Object.entries(books)) }                                            // XD
            else { reject("Error conectando con la base de datos.") };
        }, 10);
    })
}

async function filtradorDeLibros(req, res, next, { tipoDeFiltro: queryType }) {
    // const queryType = "author";                                      // String     : tipoDeFiltro
    try {
        if (!queryType) { return res.status(404).json({ message: `El valor a consultar no debe estar en blanco.` }) }

        const buscado = req.params[queryType]?.toLowerCase();           // variable 'querytype'. Es la única de la fn async.

        const libros = await getArrayDB2();                               // Array[[k,v],] : libros db2
        let arrayFiltrado = libros.filter(([key, book]) => (book[queryType]?.toLowerCase().includes(buscado)));
        let filteredBooks = arrayFiltrado.map(([isbn, book]) => ({ isbn, ...book }));
        return filteredBooks.length > 0
            ? res.status(200).json(filteredBooks)                       // Array[{},] : output
            : res.status(404).json({ message: `No hay libros para mostrar, ${queryType} no encontrado.` });
    }
    catch (err) {
        next(err);
    }
};


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        if (password.length < 8) {
            return res.status(400).json({ message: `Contraseña insegura. Incluye 8 o más caracteres.` });
        }
        if (!doesUserExist(username)) {                    // ¿es nuevo el user?
            users.push({ username, password });
            return res.status(200).json({ message: `Usuario '${username}' registrado exitosamente.` });
        }
        return res.status(409).json({ message: `El username '${username}' ya está en uso. Elija uno distinto.` })
    }
    return res.status(400).json({ message: "No ingresó el 'username' o el 'password'. Complete las credenciales e intente nuevamente." });
});


// Get the book list available in the shop
public_users.get('/', async function (req, res, next) {       // ASYNC callbackFn
    console.log("respondiendo..OK");
    try {
        const libros = await getDB2();                  // new Promise
        return res.status(200).json(libros);
    } catch (err) {
        next(err);

    }

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res, next) {
    try {
        const isbn = req.params.isbn;
        const libros = await getDB2();
        return libros[isbn]
            ? res.status(200).json({ isbn: [isbn], Resultado: libros[isbn] })
            : res.status(404).json({ message: `No encontrado. ISBN '${isbn}' inválido.` });
    } catch (err) {
        next(err);
    }


});

// Get book details based on author
public_users.get('/author/:author', async function (req, res, next) {
    try {
        filtradorDeLibros(req, res, next, { tipoDeFiltro: "author" });
    } catch (err) {
        next(err);
    }

});

// Get all books based on title
public_users.get('/title/:title', async function (req, res, next) {
    try {
        filtradorDeLibros(req, res, next, { tipoDeFiltro: "title" });
    } catch (err) {
        next(err);
    }
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res, next) {
    try {
        const isbn = req.params.isbn;
        const libros = await getDB2();
        let libro = libros[isbn];
        if (libro) {
            return Object.values(libro.reviews).length > 0
                ? res.status(200).json(libro.reviews)
                : res.status(200).json({ message: `ISBN: '${isbn}'. El libro seleccionado aún no posee reviews.` });
        }
        return res.status(404).json({ message: `No encontrado. ISBN '${isbn}' inválido.` });

    } catch (err) {
        next(err);
    }
});

module.exports.general = public_users;
