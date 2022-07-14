const express = require ('express')
const { Router } = require('express')
const fs = require("fs");
const app = express()

const exphbs = require("express-handlebars")
app.engine(".hbs", exphbs.engine({
    defaultLayout: "main",
    layoutsDir: __dirname + "./views/layouts",
    partialsDir: __dirname + "./views/partials",
    extname: ".hbs"
}));

app.set("view engine", ".hbs")
app.set("views", "./views")

app.use(express.static('public'))

const routerProductos = Router()
app.use('/api/productos', routerProductos)
routerProductos.use(express.json())
routerProductos.use(express.urlencoded({extended: true}))

// INICIO DEL PROGRAMA
class ContenedorApiRouter {
    constructor(fileName){
        this.fileName = fileName;
    }

    async save(object){
        try {   
                    let lectura = await fs.promises.readFile(`./src/${this.fileName}`, "utf-8")
                    let existents = JSON.parse(lectura)
                    let listObj = [...existents, object]
                    await fs.promises.writeFile(`./src/${this.fileName}`, JSON.stringify(listObj))
            }
        catch(err){
            console.log("ERROR 2 - CREACION DE FILE (save)");
        }
    }

    async getById(id){
        try {
            let lectura = await fs.promises.readFile(this.fileName, "utf-8")
            let prods = JSON.parse(lectura)
            let prodFind = prods.find(prod => prod.id == id)
            if(prodFind){
                console.log(prodFind)
            }else{console.log(null)}
            }
        catch(err){console.log("ERROR 1 - LECTURA DE FILE");}
    }

    async getRandom(){
        try {
            let lectura = await fs.promises.readFile(this.fileName, "utf-8")
            let prods = JSON.parse(lectura)
            let prodRandom = prods.sort(()=> Math.round(Math.random())-1)
            return prodRandom[1];
            }
        catch(err){console.log("ERROR 1 - LECTURA DE FILE");}
    };

    async getAll(){
        try {
            let lectura = await fs.promises.readFile(this.fileName, "utf-8")
            let prods = await JSON.parse(lectura)
            return prods;
            }
        catch(err){console.log("ERROR 1 - LECTURA DE FILE");}
    };

    async deleteById(id){
        try {
            let lectura = await fs.promises.readFile(this.fileName, "utf-8")
            let prods = JSON.parse(lectura)
            let prodFilterDeleteID = prods.filter(prod => prod.id !== id)
            console.log(prodFilterDeleteID)
            await fs.promises.writeFile(this.fileName, JSON.stringify(prodFilterDeleteID))
            console.log("Guardado ELIMINANDO ID");
            }
            
        catch(err){console.log("ERROR 1 - LECTURA DE FILE");}
    };

    async deleteAll(){
        const prodListVoid = [];
        try {
            await fs.promises.writeFile(this.fileName, JSON.stringify(prodListVoid))
            console.log("Guardado VACIO");
        }
        catch(err){
            console.log("ERROR 3 - AL VACIAR FILE");
        }
    }
};

// ------------------ PRODUCTOS (ENTREGABLE)
const archivoApiRouter = new ContenedorApiRouter("productosHBS.txt");

// DEVUELVE TODOS LOS PRODUCTOS
routerProductos.get('/listar', async (req, res) => {
    let lectura = await fs.promises.readFile("./src/productosHBS.txt", "utf-8")
    let prods = JSON.parse(lectura)
    res.render("index", { prods } );
})

routerProductos.get('/listar/:id', async (req, res) => {
    const id = Number(req.params.id);

    let lectura = await fs.promises.readFile("./src/productosHBS.txt", "utf-8")
    let prods = JSON.parse(lectura)

    // if(id < 1 || id > prods.length){
    //     return res.send({error: "Producto no encontrado"})
    // }
    const filtered = prods.filter(prod => prod.id == id)
    res.json(filtered)
})

routerProductos.post('/guardar', async (req, res) => {
    // AGREGA DATO AL ARRAY
    let lectura = await fs.promises.readFile("./src/productosHBS.txt", "utf-8")
    let prods = JSON.parse(lectura)
    // req.body.id = Math.round(Math.random() * 9999);
    req.body.id = prods.length + 1;
    archivoApiRouter.save(req.body)
    // DEVUELVE AL BODY DEL POST PARA CONFIRMAR LA ACCION
    res.json(req.body)
})

routerProductos.put('/actualizar/:id', (req, res) => {
    const id = Number(req.params.id);
    if(id < 1 || id != (productos.id = id)){
        return res.send({error: "Producto no encontrado"})
    }
    req.body.id = id
    productos.splice(id - 1, 1, req.body)
    productos.sort((a,b)=>a.id-b.id)

    res.json(req.body)
})

routerProductos.delete('/eliminar/:id', async (req, res) => {
    const id = Number(req.params.id);

    let lectura = await fs.promises.readFile("./src/productosHBS.txt", "utf-8")
    let prods = JSON.parse(lectura)

    const filtered = prods.filter(prod => prod.id == id)
    console.log(filtered);
    if(id < 1 || id != filtered.id){
        return res.send({error: "Producto no encontrado"})
    }
    req.body.id = id
    // productos.splice(id - 1, 1)
    // productos.sort((a,b)=>a.id-b.id)
    archivoApiRouter.deleteById(id)
    // DEVUELVE AL BODY DEL POST PARA CONFIRMAR LA ACCION
    res.json(req.body)
})

// ----------- SERVER
const PORT = 8080
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${server.address().port}`);
})
server.on('error', error => console.log(`Error en servidor ${error}`));

