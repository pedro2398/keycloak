import express from 'express';

const app = express();

app.get('/login', (req, res) => {
    const loginParams = new URLSearchParams({
        client_id: 'fdq-client',
        redirect_uri: 'http://localhost:3000/callback',
        response_type: 'code',
        scope: 'openid'
    });

    const url = `http://localhost:8080/realms/fdq-realm/protocol/openid-connect/auth?${loginParams.toString()}`

    console.log(url)
    res.redirect(url)
})

app.get('/callback', async (req, res) => {
    console.log('query', req.query)

    const bodyParams = new URLSearchParams({
        client_id: 'fdq-client',
        grant_type: 'authorization_code',
        code: req.query.code as string,
        redirect_uri: 'http://localhost:3000/callback',
    })
    
    const url = "http://host.docker.internal:8080/realms/fdq-realm/protocol/openid-connect/token"
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams.toString()
    });

    const result = await response.json();

    console.log('respose: ',result);

    res.json(result)
})

app.listen(3000, () => {
    console.log('rodando...')
})