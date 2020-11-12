const { Subject, ReplaySubject } = require('rxjs')

const onDataChannel = ({ event, subject }) => {

  const open$ = new Subject()
  const close$ = new Subject()
  const error$ = new Subject()
  const channel$ = new Subject()
  const bufferedAmountLow$ = new Subject()

  const send$ = new Subject()
  const off$ = new Subject()

  const { channel } = event

  channel.onopen = e => open$.next(e)
  channel.onclose = e => close$.next(e)
  channel.onmessage = e => close$.next(e)
  channel.bufferedamountlow = e => bufferedAmountLow$.next(e)

  channel$.next(channel)

  subject.next({
    open$,
    close$,
    error$,
    bufferedAmountLow$,
    send$,
    off$,
    channel$
  })
}

const createWebrtcConnection = ({ iceServers } = {}) => {

  const log$ = new Subject()
  const pc$ = new ReplaySubject(1)
  const onNegotiationNeeded$ = new Subject()
  const onIceCandidate$ = new Subject()
  const onDataChannel$ = new Subject()
  const createOffer$ = new Subject()
  const createAnswer$ = new Subject()
  const onIceConnectionStateChange$ = new Subject()
  const onIceGatheringStateChange$ = new Subject()
  const onSignalingStateChange$ = new Subject()
  const onTrack$ = new Subject()

  const getUserMedia$ = new Subject()
  const getSenders$ = new Subject()
  const addIceCandidate$ = new Subject()
  const createDataChannel$ = new Subject()
  const restartIce$ = new Subject()
  const close$ = new Subject()

  const pc = new RTCPeerConnection({
    iceServers
  })

  pc.ondatachannel = event => onDataChannel({ event, subject: onDataChannel$ })
  pc.onicecandidate = e => onIceCandidate$.next(e)
  pc.onnegotiationneeded = e => onNegotiationNeeded$.next(e)
  pc.oniceconnectionstatechange = e => onIceConnectionStateChange$.next(e)
  pc.onicegatheringstatechange = e => onIceGatheringStateChange$.next(e)
  pc.onsignalingstatechange = e => onSignalingStateChange$.next(e)
  pc.ontrack = e => onTrack$.next(e)

  pc$.next(pc)

  close$
    .subscribe(event => {
      pc.close()
    })

  restartIce$
    .subscribe(event => {
      pc.restartIce()
    })

  onDataChannel$
    .subscribe(event => {

    })
}

exports.createWebrtcConnection = createWebrtcConnection
