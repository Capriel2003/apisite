const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");
const jwt = require("jsonwebtoken");

const cors = require('cors');
const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

const app = express();
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


app.get("/auth", (req, res) => {
    try {
        client.query("SELECT * FROM users Where email = $1 and password = $2", [req.params.email, req.params.password])
    }
    catch {

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


app.post("/users", (req, res) => {
    try {
        console.log("Chamou post", req.body);
        const { nome, email } = req.body;
        client.query(
            "INSERT INTO users (nome, email) VALUES ($1, $2) RETURNING * ",
            [nome, email],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de INSERT", err);
                }
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
            }
        );
    } catch (erro) {
        console.error(erro);
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



app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            return res.status(401).json({ msg: "email ou senha vazios" });
        }

        let cliente = await client.query("SELECT * FROM users WHERE email = $1", [email])

        if (!cliente) {
            console.log("usuario nao encontrado");
            return res.status(401).json({ msg: "email ou senha nao encontrado" });
        }
        if (cliente.rows[0].password === password) {
            console.log("caixa");
            return res.status(200).json({ msg: "sucesso" });
        }

    } catch (erro) {
        console.log(erro);
    }
});






app.listen(config.port, () =>
    console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app; 