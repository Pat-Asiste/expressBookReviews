const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

// let users = [];                             // registered users in 'Auth module'

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

// Autentication -- jwt.verify()
app.use("/customer/auth", function auth(req, res, next) {
    //Write the authenication mechanism here
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];   // token encriptado
        jwt.verify(token, "access", (err, payload) => {
            if (!err) {     // logueado y registrado
                req.user = payload;                             // pwd : token descifrado
                return next();
            }               // registrado
            return res.status(403).json({ message: "Usuario sin autenticar o expirado. Favor de log-in." })    // login    == jwt.sign
        })
    } else {                // sin registrar
        return res.status(403).json({ message: "Cuenta no registrada. Favor registrarse." })                    // register == POST userdata
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
