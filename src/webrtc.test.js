const { createWebrtcConnection } = require('./webrtc')

describe('webrtc test', () => {

  afterAll(() => {

  })

  describe.skip('basic behavior', () => {

    beforeAll(() => {
      ({
        connect$,
        close$,
        open$,
        status$,
        messages$,
        send$
      } = createWebrtcConnection({

      }))
    })

    it('xxx', () => {

    })

  })
})
