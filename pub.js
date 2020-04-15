const http = require('http')

const Updater = require('./gen')
const reqBody = require('./req-body')

const port = 8888
const { pid } = process

const subscribers = new Set()

const router = {
  POST: {
    sub: async(req) => {
      const { endpoint } = await reqBody(req)
      console.log(`SUB ${endpoint}`)
      subscribers.add(endpoint)
    }
  },
  DELETE: {
    sub: (req) => {
      const { body: { endpoint } } = req
      console.log(`DEL ${endpoint}`)
      subscribers.delete(endpoint)
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

server.listen(port, async() => {
  console.log(JSON.stringify({ port, pid }))
  const gen = new Updater()

  gen.on('update', data => {
    subscribers.forEach(sub => sendUpdate(sub, data))
  })

  await gen.run()
})

function sendUpdate(sub, data) {
  const [protocol, host, portpath] = sub.split(':')
  const hostname = host.replace('//', '')
  const [port, path] = portpath.split('/')
  const postData = JSON.stringify(data)

  const options = {
    hostname: hostname,
    port,
    path: `/${path}`,
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
}

process.on('SIGINT', () => {
  server.close(() => {
    console.log('gracefull shutdown')
    process.exit(0)
  })
})