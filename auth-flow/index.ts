import { randomBytes } from 'crypto';
import express from 'express';
import { jwtDecode } from 'jwt-decode';
import session from 'express-session';

const app = express();

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));  

app.get('/login', (req, res) => {

    const nonce: string = randomBytes(16).toString("base64");
    
    //@ts-expect-error
    req.session.nonce = nonce;
    req.session.save()

    const loginParams = new URLSearchParams({
        client_id: 'fdq-client',
        redirect_uri: 'http://localhost:3000/callback',
        response_type: 'code',
        scope: 'openid',
        nonce
    });

    const url = `http://localhost:8080/realms/fdq-realm/protocol/openid-connect/auth?${loginParams.toString()}`

    console.log('url: ', url)
    res.redirect(url)
})

app.get('/callback', async (req, res) => {

    console.log('query', req.query)

    const bodyParams = new URLSearchParams({
        client_id: "fdq-client",
        grant_type: "authorization_code",
        code: req.query.code?.toString() as string,
        redirect_uri: "http://localhost:3000/callback",        
    })
    
    const url = "http://host.docker.internal:8080/realms/fdq-realm/protocol/openid-connect/token"

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-type": "application/x-www-form-urlencoded"
        },
        body: bodyParams.toString()
    });

    const result = await response.json();

    console.log('response: ', result);

    const payloadIdTokenNonce = jwtDecode(result.id_token as string);

    //@ts-expect-error
    const requestNonce = req.session.nonce;

    if(payloadIdTokenNonce.nonce !== requestNonce ) {
       return res.status(401).json({message: 'Unauthenticadet'});
    }

    res.json(result)
})

app.listen(3000, () => {
    console.log('rodando...')
})