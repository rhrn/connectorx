const { Subject, combineLatest, ReplaySubject, of } = require('rxjs')
const { map, repeatWhen, delay, takeUntil, switchMap } = require('rxjs/operators')

const asJSON = JSON.parse
const asString = JSON.stringify

const createWebsocketConnection = ({ reconnectTimeout = 5000 } = {}) => {

  const connect$ = new Subject()
  const open$ = new Subject()
  const socket$ = new ReplaySubject(1)
  const message$ = new Subject()
  const close$ = new Subject()
  const error$ = new Subject()
  const status$ = new Subject()
  const messages$ = new Subject()
  const send$ = new Subject()
  const log$ = new Subject()
  const reconnect$ = new Subject()
  const disconnect$ = new Subject()

  connect$
    .pipe(
      switchMap(v => of(v).pipe(
        repeatWhen(() => reconnect$.pipe(
          takeUntil(disconnect$),
          delay(reconnectTimeout)
        ))
      ))
    )
    .subscribe(({ url, protocols = [] }) => {
      const ws = new WebSocket(url, protocols)
      ws.onopen = e => open$.next(e)
      ws.onmessage = e => message$.next(e)
      ws.onclose = e => close$.next(e)
      ws.onerror = e => error$.next(e)
    })

  open$
    .subscribe(e => {
      status$.next({ status: 'connected' })
      socket$.next(e.target)
    })

  message$
    .pipe(
      map(e => asJSON(e.data))
    )
    .subscribe(data => {
      messages$.next(data)
    })

    close$
      .subscribe(event => {
        log$.next({ type: 'info', message: "Socket was closed because: ", event })
        status$.next({ status: 'disconnected' })
        reconnect$.next()
      })

  error$
    .subscribe(event => {
      log$.next({ type: 'error', message: "Socket had an error", event })
    })

  combineLatest([socket$, send$])
    .pipe(
      map(([ws, msg]) => {
        msg = asString(msg)
        return [ws, msg]
      })
    )
    .subscribe(([ws, msg]) => {
      ws.send(msg)
    })

  combineLatest([socket$, disconnect$])
    .subscribe(([ws]) => {
      ws.close()
    })

  return {
    connect$,
    open$,
    socket$,
    message$,
    close$,
    error$,
    status$,
    messages$,
    send$,
    log$,
    disconnect$
  }
}

exports.createWebsocketConnection = createWebsocketConnection
