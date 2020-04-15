const http = require('http')

const reqBody = require('./req-body')

const port = 8889
const { pid } = process

const router = {
  POST: {
    updates: async (req) => {
      const update = await reqBody(req)
      console.log(`UPDATES ${JSON.stringify(update)}`)
    }
  },
  GET: {
    root: () => ({ message: 'Welcome to root!'})
  }
}

const server = http.createServer((req, res) => {
  const { method, url, query, body } = req

  console.log(`${method} ${url}`)
  const resource = url === '/' ? 'root' : url.replace('/', '')
  const handler = router[method][resource]

  if(handler) {
    const result = handler(req)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result))
  } else {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ message: "Not found", status: 404 }))
  }
})

server.listen(port, () => {
  console.log(JSON.stringify({ port, pid }))

  const postData = JSON.stringify({
    endpoint: 'http://localhost:8889/updates'
  })

  const options = {
    hostname: 'localhost',
    port: 8888,
    path: '/sub',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  const req = http.request(options, res => {
    // console.log(res)
  })

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`)
  })

  req.write(postData)
  req.end()
})

process.on('SIGINT', () => {
  server.close(() => {
    console.log('gracefull shutdown')
    process.exit(0)
  })
})