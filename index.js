const express = require('express')
const Gtts = require('gtts');
const app = express()
const port = 3000
const cors = require('cors')
const http = require("http");

if(process.env.NODE_ENV != "production"){
  require("dotenv").config()
}


app.use(express.static('public'))
app.set('views', './views')
app.set('view engine', 'pug')
app.use(cors())

app.use(express.json()) // for parsing application/json

app.get('/', (req, res) => {
  res.render("index")
})

app.get('/ran', (req, res) => {
  res.json({ data: Math.random() })
})

app.post("/to-speak/:lang", (req, res) => {
  const { data } = req.body
  const { lang } = req.params

  console.log(`
    lang: ${lang}
    data: ${data}
  `)
  const gtts = new Gtts(data, lang);
  gtts.stream().pipe(res)
})
// 

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

let clock
const awake = () => {
  clock = setTimeout(() => {
    http.get(process.env.URL);
    clearTimeout(clock)
    awake()
  }, Math.ceil(getRandomArbitrary(4, 5) * 60000))
}

awake()

// 
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})