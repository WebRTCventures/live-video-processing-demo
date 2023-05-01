function createProcessedTrack({ track, transform }) {
  const trackProcessor = new MediaStreamTrackProcessor({ track });
  const trackGenerator = new MediaStreamTrackGenerator({ kind: track.kind });

  const transformer = new TransformStream({ transform });

  trackProcessor.readable
    .pipeThrough(transformer)
    .pipeTo(trackGenerator.writable);

  return trackGenerator;
}

function showText({
  text,
  track,
  txtColor = 'white',
  txtFontSize = '48px',
  txtFont = 'serif',
  textSpeed = 2,
  bgColor = '#9c28b8',
  bgPadding = 10,
  position = 'top'
}) {
  const { width, height } = track.getSettings();
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const intTxtFontSize = parseInt(txtFontSize);
  const bgHeight = intTxtFontSize + bgPadding;
  const bgPositionY = position === 'bottom' 
    ? height - (intTxtFontSize + bgPadding + 5) 
    : 5;
  const txtPositionY = position === 'bottom' 
    ? height - (intTxtFontSize + Math.floor(bgPadding/2) + 5) 
    : 5 + intTxtFontSize;

  let x = width + 100;
  function transform(videoFrame, controller) {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(videoFrame, 0, 0, width, height);
    ctx.font = txtFontSize + ' ' + txtFont;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, bgPositionY, width, bgHeight)
    ctx.fillStyle = txtColor;
    ctx.fillText(text, x, txtPositionY);

    x -= textSpeed;
    if (x <= (0 - 100 - text.length * 20)) {
      x = width + 100
    }
    const newFrame = new VideoFrame(canvas, { timestamp: videoFrame.timestamp });

    videoFrame.close();
    controller.enqueue(newFrame);
  }

  return createProcessedTrack({ track, transform });
}