import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('foi!')
})

app.listen(3000, () => {
    console.log('rodando...')
})