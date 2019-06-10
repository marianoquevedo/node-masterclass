

// dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')
const fs = require('fs')

const decoder = new StringDecoder('utf-8')

// create HTTP server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res)
})

// create HTTPS server
const httpsOptions = {
  key: fs.readFileSync('./certificates/key.pem'),
  cert: fs.readFileSync('./certificates/cert.pem'),
}

const httpsServer = https.createServer(httpsOptions, (req, res) => {
  unifiedServer(req, res)
})

// TODO: HTTP/2?

httpServer.listen(config.port, () => {
  console.log(`HTTP server is listening on port ${config.port}`)
})

httpsServer.listen(config.httpsPort, () => {
  console.log(`HTTPS server is listening on port ${config.httpsPort}`)
})

// common server logic
const unifiedServer = (req, res) => {

  // get the url and parse it
  const parsedUrl = url.parse(req.url, true)

  // get the path of the url without any extra "/"
  const trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

  const queryString = parsedUrl.query

  // get HTTP method
  const method = req.method.toLowerCase()

  // get headers
  const headers = req.headers

  // get payload (optional)
  let stringPayload = ''
  req.on('data', (data) => {
    stringPayload += decoder.write(data)
  })

  req.on('end', () => {
    stringPayload += decoder.end()

    // reqdata
    const reqData = {
      method,
      path: trimmedPath,
      body: stringPayload,
      queryString
    }

    // log the path
    console.log(reqData)

    // route the request
    const handler = routers[trimmedPath] || routers['notFound']

    handler(reqData, (err, handlerResponse) => {

      res.statusCode = handlerResponse.status

      if (handlerResponse.body) {
        if (typeof(handlerResponse.body) == 'object') {
          res.setHeader('content-type', 'application/json')
          res.write(JSON.stringify(handlerResponse.body))
        }
        else {
          res.write(handlerResponse.body)
        }
      }

      res.end()
    })
  })
}

const routers = {
  notFound: function (reqData, cb) {
    return cb(null, {
      status: 404
    })
  },
  ping: function (reqData, cb) {
    return cb(null, {
      status: 200,
      body: 'pong'
    })
  }
}
