const express = require('express')
const config  = require('./config.json')

const app = express()
const port = config.port || 4800

app.use(express.static('public'))
app.set('view engine', 'pug')


app.get('/', (req, res) => {
  res.render('index', {
    title: 'Donate to GitHub Repositories'
  })
})

app.listen(port, () => {
  console.log('readme-donations app running on port ' + port + '!')
})
