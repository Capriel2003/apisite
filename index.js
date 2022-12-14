const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");
const jwt = require("jsonwebtoken");

const app = express();

const corsOptions ={
    origin:'*', 
    credentials:true,            
    optionSuccessStatus:200
}
app.use(cors(corsOptions));


app.use(express.json());
app.use(bodyparser.json());


var conString = config.urlConnection;
var client = new Client(conString);
client.connect(function (err) {
    if (err) {
        return console.error('Não foi possível conectar ao banco.', err);
    }
    client.query('SELECT NOW()', function (err, result) {
        if (err) {
            return console.error('Erro ao executar a query.', err);
        }
        console.log(result.rows[0]);
    });
});


app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Ok - Servidor disponível.");
});


app.get("/users", (req, res) => {
    try {
        client.query("SELECT * FROM users", function
            (err, result) {
            if (err) {
                return console.error("Erro ao executar a qry de SELECT", err);
            }
            res.send(result.rows);
            console.log("Chamou get users");
        });
    } catch (error) {
        console.log(error);
    }
});


app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            return res.status(401).json({ msg: "email ou senha vazios" });
        }

        client.query("SELECT * FROM users WHERE email = $1", [email], (err, result)=>{
            if (err || result.rowCount === 0) {
                console.log("usuario nao encontrado");
                return res.status(401).json({ msg: "email ou senha nao encontrado" });
            }
            if (result.rows[0].password === password) {
                console.log("caixa");
                return res.status(200).json({ msg: "sucesso" });
            }
        })

    } catch (erro) {
        console.log(erro);
    }
});



app.post("/users", (req, res) => {
    try {
        const { name, email, password, permisions } = req.body;
        client.query(
            "INSERT INTO users (name, email, password, permisions) VALUES ($1, $2, $3, $4) RETURNING * ",
            [name, email, password, permisions],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de INSERT", err);
                }
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                return res.status(201).json(result.rows[0]);
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});


















app.get("/users", (req, res) => {
    try {
        client.query("SELECT * FROM users", function
            (err, result) {
            if (err) {
                return console.error("Erro ao executar a qry de SELECT", err);
            }
            res.send(result.rows);
            console.log("Chamou get users");
        });
    } catch (error) {
        console.log(error);
    }
});

app.get("/users/:id", (req, res) => {
    try {
        console.log("Chamou /:id " + req.params.id);
        client.query(
            "SELECT * FROM users WHERE id = $1",
            [req.params.id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de SELECT id", err);
                }
                res.send(result.rows);
                console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.delete("/users/:id", (req, res) => {
    try {
        console.log("Chamou delete /:id " + req.params.id);
        const id = req.params.id;
        client.query(
            "DELETE FROM users WHERE id = $1",
            [id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de DELETE", err);
                } else {
                    if (result.rowCount == 0) {
                        res.status(400).json({ info: "Registro não encontrado." });
                    } else {
                        res.status(200).json({ info: `Registro excluído. Código: ${id}` });
                    }
                }
                console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});


app.put("/users/:id", (req, res) => {
    try {
        console.log("Chamou update", req.body);
        const id = req.params.id;
        const { nome, email } = req.body;
        client.query(
            "UPDATE users SET nome=$1, email=$2 WHERE id =$3 ",
            [nome, email, id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de UPDATE", err);
                } else {
                    res.setHeader("id", id);
                    res.status(202).json({ id: id });
                    console.log(result);
                }
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});


app.listen(config.port, () =>
    console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app; 