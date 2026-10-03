// Auth module ---------------------

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const doesUserExist = (username) => {           // usado en 'Register user'
    const filteredUser = users.filter((user) => (user.username === username));
    return filteredUser.length > 0;             // return a boolean.
};

const isRegistered = (username, password) => {  // usado en 'Login user'
    const filteredUser = users.filter((user) => (user.username === username && user.password === password));
    return filteredUser.length > 0;             // return a boolean.
};

//only registered users can login

// ./customer/login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) { return res.status(400).json({ message: "Login inválido." }) }
    if (isRegistered(username, password)) {
        let accessToken = jwt.sign(
            { data: password },
            'access',
            { expiresIn: 60 * 60 }
        );
        req.session.authorization = { accessToken, username };      // { xxxx, username }
        return res.status(200).json({ message: `'${username}', iniciaste sesión exitosamente. Ya puedes añadir tus reseñas.` })
    }
    return res.status(400).json({ message: "Login inválido. Revise su usuario y contraseña." });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { username } = req.session.authorization;
    const { isbn } = req.params;
    const newReview = String(req.body.review).trim();

    const libro = books[isbn];
    if (!libro) { return res.status(404).json({ message: `Libro no encontrado. ISBN '${isbn}' inválido.` }); }
    if (!newReview) { return res.status(400).json({ message: `Error: Su reseña no puede estar vacía.` }); }
    books[isbn].reviews = { ...books[isbn].reviews, [username]: newReview };
    return res.status(200).json({
        message: `Reseña de ${username}, actualizada exitosamente. Puedes ver las últimas reseñas accediendo a '/review/:isbn'`,
        book_info: {
            isbn: isbn,
            title: libro.title,
            reviews: libro.reviews
        }
    });
});

// Borrar la review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { username } = req.session.authorization;
    const { isbn } = req.params;

    const libro = books[isbn];
    if (!libro) { return res.status(404).json({ message: `Libro no encontrado. ISBN '${isbn}' inválido.` }); }
    delete books[isbn].reviews[username];
    return res.status(200).json({
        message: `Review para ISBN ${isbn} borrada exitosamente.'.`,
        user:[username],
        book_info: {
            isbn: isbn,
            title: libro.title,
            reviews: libro.reviews
        }
    });
});

module.exports.authenticated = regd_users;
module.exports.doesUserExist = doesUserExist;
module.exports.users = users;
