

// dependencies
const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder

// config
const port = 4000

const decoder = new StringDecoder('utf-8')

// create server
const server = http.createServer((req, res) => {

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
})

server.listen(port, () => {
  console.log(`server is listening on port ${port}`)
})


const routers = {
  notFound: function (reqData, cb) {
    return cb(null, { status: 404 })
  },
  sample: function (reqData, cb) {
    return cb(null, {status: 200, body: 'hallo'})
  },
  jason: function (reqData, cb) {
    return cb(null, {status: 200, body: { id: '22' }})
  }
}
