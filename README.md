# connectorx

- [x] Websocket rxjs wrapper
  - json
  - reconnect

### installation
```
npm install connectorx
```

### examples
  - [websocket nodejs](https://github.com/rhrn/connectorx/blob/master/examples/nodejs/websocket.js)
```js
const { createWebsocketConnection } = require('connectorx')

global.WebSocket = require('ws')

const url = 'wss://echo.websocket.org'

const { connect$, send$, messages$, open$, status$, error$ } = createWebsocketConnection()

connect$.next({ url, protocols: [] })

status$.subscribe(status => console.log('connection', url, status))

error$.subscribe(error => console.log('error', error.message))

open$.subscribe(() => {
  const message = { date: new Date() }
  console.log('Send message', message)
  send$.next({ date: new Date() })
})

messages$.subscribe(message => {
  console.log('Receive Message', message)

  message.date = new Date()
  console.log('Send message', message)
  send$.next(message)
})
```
