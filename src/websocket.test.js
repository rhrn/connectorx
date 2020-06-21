const { Subject, ReplaySubject, timer, interval } = require('rxjs')
const { take, tap, skipUntil } = require('rxjs/operators')

const { createWebsocketConnection } = require('./websocket')

const asString = JSON.stringify

const serverClient$ = new ReplaySubject(1)
const serverMessages$ = new Subject()

const WebSocket = require('ws')

global.WebSocket = WebSocket

const wss = new WebSocket.Server({ port: 5000 })

wss.on('connection', function connection(ws) {
  serverClient$.next({ ws })
  ws.on('message', data => serverMessages$.next(data))
})

describe('websocket test', () => {

  afterAll(() => {
    wss.close()
  })

  describe('basic behavior', () => {
    let connect$
    let close$
    let open$
    let send$
    let status$
    let messages$

    let currentStatus

    beforeAll(() => {
      ({
        connect$,
        close$,
        open$,
        status$,
        messages$,
        send$
      } = createWebsocketConnection())
      status$.subscribe(({ status }) => currentStatus = status)
    })

    it('connect$', done => {
      open$
        .pipe(
          take(1)
        )
        .subscribe(
          () => done(),
          err = err => done(err)
        )
      connect$.next({ url: 'ws://localhost:5000' })
    })

    it('send$', done => {
      const msg = { hello: 'world' }

      serverMessages$
        .pipe(
          take(1)
        )
        .subscribe(data => {
          expect(asString(msg)).toEqual(data)
          done()
        })

      send$.next(msg)
    })

    it('messages$', done => {
      const msg = { world: 'hello' }

      messages$
        .pipe(
          take(1)
        )
        .subscribe(data => {
          expect(msg).toEqual(data)
          done()
        })

      serverClient$
        .pipe(
          take(1)
        )
        .subscribe(({ ws }) => {
          ws.send(asString(msg))
        })
    })

    it('close$', done => {
      close$
        .pipe(
          take(1)
        )
        .subscribe(closeEvent => {
          expect(closeEvent.wasClean).toBeTruthy()
          expect(closeEvent.code).toBe(1005)
          done()
        })

      serverClient$
        .pipe(
          take(1)
        )
        .subscribe(({ ws }) => {
          ws.close()
        })
    })
  })

  describe('reconnect', () => {
    let connect$
    let close$
    let open$
    let status$
    let send$

    beforeAll(() => {
      ({
        connect$,
        close$,
        open$,
        status$,
        messages$,
        send$
      } = createWebsocketConnection({
        reconnectTimeout: 0
      }))
    })

    it('reconnect$', done => {
      const open = jest.fn()

      open$
        .subscribe(() => {
          open()
        })

      serverClient$
        .subscribe(({ ws }) => {
          ws.close()
        })

      interval(10)
        .pipe(
          take(1)
        )
        .subscribe(() => {
          expect(open.mock.calls.length).toBeGreaterThanOrEqual(2)
          done()
        })

      connect$.next({ url: 'ws://localhost:5000' })
    })
  })

  describe('disconnect', () => {
    let connect$
    let close$
    let open$
    let disconnect$

    beforeAll(() => {
      ({
        connect$,
        close$,
        open$,
        disconnect$,
      } = createWebsocketConnection({
        reconnectTimeout: 0
      }))
    })

    it('disconnect$', done => {
      const open = jest.fn()
      const close = jest.fn()

      open$
        .subscribe(() => {
          open()
          disconnect$.next()
        })

      close$
        .subscribe(() => {
          close()
        })

      interval(10)
        .pipe(
          take(1)
        )
        .subscribe(() => {
          expect(open.mock.calls.length).toEqual(1)
          expect(close.mock.calls.length).toEqual(1)
          done()
        })

      connect$.next({ url: 'ws://localhost:5000' })
    })
  })

  describe('errors', () => {

    let connect$
    let error$

    beforeAll(() => {
      ({
        connect$,
        error$
      } = createWebsocketConnection({
        reconnectTimeout: 0
      }))
    })

    it('error$ on connect', done => {

      error$
        .subscribe(event => {
          expect(event.type).toEqual('error')
          done()
        })

      serverClient$
        .subscribe(({ ws }) => {
          ws.close()
        })

      connect$.next({ url: 'ws://localhost:5001' })
    })

  })

})
