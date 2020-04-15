module.exports = async req => new Promise(resolve => {
  const body = []
  req.on('data', chunk => {
    body.push(chunk)
  }).on('end', async () => {
    const data = body.join('')
    const args = JSON.parse(data)
    resolve(args);
  })
})