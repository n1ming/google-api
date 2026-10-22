'use strict';

const AUDIO_CAPABILITIES = Object.freeze({
  codecs: Object.freeze([
    Object.freeze({ mimeType: 'audio/opus', clockRate: 48000, channels: 2, sdpFmtpLine: 'minptime=10;useinbandfec=1' }),
    Object.freeze({ mimeType: 'audio/red', clockRate: 48000, channels: 2 }),
    Object.freeze({ mimeType: 'audio/G722', clockRate: 8000, channels: 1 }),
    Object.freeze({ mimeType: 'audio/PCMU', clockRate: 8000, channels: 1 }),
    Object.freeze({ mimeType: 'audio/PCMA', clockRate: 8000, channels: 1 }),
    Object.freeze({ mimeType: 'audio/CN', clockRate: 8000, channels: 1 }),
    Object.freeze({ mimeType: 'audio/telephone-event', clockRate: 48000, channels: 1 }),
    Object.freeze({ mimeType: 'audio/telephone-event', clockRate: 8000, channels: 1 })
  ]),
  headerExtensions: Object.freeze([
    Object.freeze({ uri: 'urn:ietf:params:rtp-hdrext:ssrc-audio-level' }),
    Object.freeze({ uri: 'http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time' }),
    Object.freeze({ uri: 'http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01' }),
    Object.freeze({ uri: 'urn:ietf:params:rtp-hdrext:sdes:mid' })
  ])
});

const VIDEO_SENDER_CAPABILITIES = Object.freeze({
  codecs: Object.freeze([
    Object.freeze({ mimeType: 'video/VP8', clockRate: 90000 }),
    Object.freeze({ mimeType: 'video/rtx', clockRate: 90000 }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42001f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42e01f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=4d001f' }),
    Object.freeze({ mimeType: 'video/AV1', clockRate: 90000, sdpFmtpLine: 'level-idx=5;profile=0;tier=0' }),
    Object.freeze({ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=0' }),
    Object.freeze({ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=2' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=640020' }),
    Object.freeze({ mimeType: 'video/H265', clockRate: 90000, sdpFmtpLine: 'level-id=156;profile-id=1;tier-flag=0;tx-mode=SRST' }),
    Object.freeze({ mimeType: 'video/red', clockRate: 90000 }),
    Object.freeze({ mimeType: 'video/ulpfec', clockRate: 90000 })
  ]),
  headerExtensions: Object.freeze([
    Object.freeze({ uri: 'urn:ietf:params:rtp-hdrext:toffset' }),
    Object.freeze({ uri: 'http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time' }),
    Object.freeze({ uri: 'urn:3gpp:video-orientation' }),
    Object.freeze({ uri: 'http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01' }),
    Object.freeze({ uri: 'http://www.webrtc.org/experiments/rtp-hdrext/playout-delay' }),
    Object.freeze({ uri: 'http://www.webrtc.org/experiments/rtp-hdrext/video-content-type' }),
    Object.freeze({ uri: 'http://www.webrtc.org/experiments/rtp-hdrext/video-timing' }),
    Object.freeze({ uri: 'http://www.webrtc.org/experiments/rtp-hdrext/color-space' }),
    Object.freeze({ uri: 'urn:ietf:params:rtp-hdrext:sdes:mid' }),
    Object.freeze({ uri: 'urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id' }),
    Object.freeze({ uri: 'urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id' })
  ])
});

const VIDEO_RECEIVER_CAPABILITIES = Object.freeze({
  codecs: Object.freeze([
    Object.freeze({ mimeType: 'video/VP8', clockRate: 90000 }),
    Object.freeze({ mimeType: 'video/rtx', clockRate: 90000 }),
    Object.freeze({ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=0' }),
    Object.freeze({ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=2' }),
    Object.freeze({ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=1' }),
    Object.freeze({ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=3' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42001f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42e01f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=4d001f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=f4001f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=f4001f' }),
    Object.freeze({ mimeType: 'video/AV1', clockRate: 90000, sdpFmtpLine: 'level-idx=5;profile=0;tier=0' }),
    Object.freeze({ mimeType: 'video/AV1', clockRate: 90000, sdpFmtpLine: 'level-idx=5;profile=1;tier=0' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f' }),
    Object.freeze({ mimeType: 'video/H264', clockRate: 90000, sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=64001f' }),
    Object.freeze({ mimeType: 'video/H265', clockRate: 90000, sdpFmtpLine: 'level-id=180;profile-id=1;tier-flag=0;tx-mode=SRST' }),
    Object.freeze({ mimeType: 'video/H265', clockRate: 90000, sdpFmtpLine: 'level-id=180;profile-id=2;tier-flag=0;tx-mode=SRST' }),
    Object.freeze({ mimeType: 'video/red', clockRate: 90000 }),
    Object.freeze({ mimeType: 'video/ulpfec', clockRate: 90000 }),
    Object.freeze({ mimeType: 'video/flexfec-03', clockRate: 90000, sdpFmtpLine: 'repair-window=10000000' })
  ]),
  headerExtensions: VIDEO_SENDER_CAPABILITIES.headerExtensions
});

const DEFAULT_RTP_CAPABILITIES = Object.freeze({
  audio: AUDIO_CAPABILITIES,
  video: VIDEO_SENDER_CAPABILITIES,
  sender: Object.freeze({
    audio: AUDIO_CAPABILITIES,
    video: VIDEO_SENDER_CAPABILITIES
  }),
  receiver: Object.freeze({
    audio: AUDIO_CAPABILITIES,
    video: VIDEO_RECEIVER_CAPABILITIES
  })
});

const WEBRTC_DEFAULTS = Object.freeze({
  peerConnection: Object.freeze({
    firstConstructorDelayMs: 1208,
    connectionState: 'new',
    iceConnectionState: 'new',
    iceGatheringState: 'new',
    signalingState: 'stable',
    canTrickleIceCandidates: null,
    bundlePolicy: 'balanced',
    rtcpMuxPolicy: 'require',
    configuration: Object.freeze({
      iceServers: [],
      iceTransportPolicy: 'all',
      bundlePolicy: 'balanced',
      rtcpMuxPolicy: 'require',
      iceCandidatePoolSize: 0
    }),
    offer: Object.freeze({
      type: 'offer',
      sdp: [
        'v=0',
        'o=- 4611733056259626159 2 IN IP4 127.0.0.1',
        's=-',
        't=0 0',
        'a=group:BUNDLE 0',
        'a=extmap-allow-mixed',
        'a=msid-semantic: WMS',
        'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
        'c=IN IP4 0.0.0.0',
        'a=ice-ufrag:mini',
        'a=ice-pwd:minibrowserwebrtc',
        'a=ice-options:trickle',
        'a=fingerprint:sha-256 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF',
        'a=setup:actpass',
        'a=mid:0',
        'a=sctp-port:5000',
        'a=max-message-size:262144'
      ].join('\r\n') + '\r\n'
    }),
    answer: Object.freeze({
      type: 'answer',
      sdp: [
        'v=0',
        'o=- 4611733056259626159 2 IN IP4 127.0.0.1',
        's=-',
        't=0 0',
        'a=group:BUNDLE 0',
        'a=extmap-allow-mixed',
        'a=msid-semantic: WMS',
        'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
        'c=IN IP4 0.0.0.0',
        'a=ice-ufrag:mini',
        'a=ice-pwd:minibrowserwebrtc',
        'a=ice-options:trickle',
        'a=fingerprint:sha-256 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF',
        'a=setup:active',
        'a=mid:0',
        'a=sctp-port:5000',
        'a=max-message-size:262144'
      ].join('\r\n') + '\r\n'
    }),
    stats: Object.freeze({
      'transport-0': Object.freeze({
        id: 'transport-0',
        type: 'transport',
        timestamp: 0,
        packetsSent: 0,
        packetsReceived: 0,
        bytesSent: 0,
        bytesReceived: 0,
        iceRole: 'controlling',
        dtlsState: 'new',
        selectedCandidatePairId: 'candidate-pair-0',
        localCertificateId: 'certificate-local',
        remoteCertificateId: 'certificate-remote'
      }),
      'candidate-pair-0': Object.freeze({
        id: 'candidate-pair-0',
        type: 'candidate-pair',
        timestamp: 0,
        state: 'succeeded',
        nominated: true,
        packetsSent: 0,
        packetsReceived: 0,
        bytesSent: 0,
        bytesReceived: 0,
        totalRoundTripTime: 0,
        currentRoundTripTime: 0,
        localCandidateId: 'local-candidate-0',
        remoteCandidateId: 'remote-candidate-0',
        transportId: 'transport-0'
      }),
      'local-candidate-0': Object.freeze({
        id: 'local-candidate-0',
        type: 'local-candidate',
        timestamp: 0,
        candidateType: 'host',
        ip: '192.168.0.2',
        address: '192.168.0.2',
        port: 54321,
        protocol: 'udp',
        priority: 2122260223,
        networkType: 'ethernet'
      }),
      'remote-candidate-0': Object.freeze({
        id: 'remote-candidate-0',
        type: 'remote-candidate',
        timestamp: 0,
        candidateType: 'host',
        ip: '203.0.113.1',
        address: '203.0.113.1',
        port: 3478,
        protocol: 'udp',
        priority: 1686052607
      }),
      'certificate-local': Object.freeze({
        id: 'certificate-local',
        type: 'certificate',
        timestamp: 0,
        fingerprint: '00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF',
        fingerprintAlgorithm: 'sha-256',
        base64Certificate: ''
      }),
      'certificate-remote': Object.freeze({
        id: 'certificate-remote',
        type: 'certificate',
        timestamp: 0,
        fingerprint: 'FF:EE:DD:CC:BB:AA:99:88:77:66:55:44:33:22:11:00:FF:EE:DD:CC:BB:AA:99:88:77:66:55:44:33:22:11:00',
        fingerprintAlgorithm: 'sha-256',
        base64Certificate: ''
      })
    })
  }),
  streams: Object.freeze({
    streamId: '-',
    audioTrackId: 'audio-track',
    videoTrackId: 'video-track',
    cname: 'mini-browser',
    audioSsrc: 1525703066,
    audioRtxSsrc: 3745136040,
    videoSsrc: 1525703066,
    videoRtxSsrc: 3745136040
  }),
  rtpCapabilities: DEFAULT_RTP_CAPABILITIES,
  dataChannel: Object.freeze({
    ordered: true,
    maxPacketLifeTime: null,
    maxRetransmits: null,
    protocol: '',
    negotiated: false,
    id: null,
    reliable: true,
    readyState: 'connecting',
    binaryType: 'arraybuffer',
    bufferedAmount: 0,
    bufferedAmountLowThreshold: 0
  })
});

module.exports = {
  DEFAULT_RTP_CAPABILITIES,
  WEBRTC_DEFAULTS
};
