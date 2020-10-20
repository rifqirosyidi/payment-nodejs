if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const express = require('express')
const app = express()
const fs = require('fs')
const stripe = require('stripe')(stripeSecretKey)

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))

app.get('/store', function(req, res) {
    fs.readFile('items.json', function(err, data) {
        if (err) {
            res.status(500).end()
        } else {
            res.render('store.ejs', {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })
})

app.post('/purchase', function(req, res) {
    fs.readFile('items.json', function(err, data) {
        if (err) {
            res.status(500).end()
        } else {
            const itemsJson = JSON.parse(data)
            const itemsArray = [ ...itemsJson.music, ...itemsJson.merch]
            let total = 0
            req.body.items.forEach(item => {
                const itemJson = itemsArray.find(it => {
                    return it.id == item.id
                })
                total += itemJson.price * item.quantity
            })

            stripe.charges.create({
                amount: total,
                source: req.body.stripeTokenId,
                currency: 'usd'
            }).then(() => {
                console.log("CHARGE SUCCESS")
                res.json({
                    message: "Successfulle Purchased"
                })
            }).catch(() => {
                console.log("CHARGE FAIL")
                res.status(500).end()
            })
        }
    })
})


app.listen(3000)
