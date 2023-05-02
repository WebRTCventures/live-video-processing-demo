function createProcessedTrack({ track, transform }) {
  const trackProcessor = new MediaStreamTrackProcessor({ track });
  const trackGenerator = new MediaStreamTrackGenerator({ kind: track.kind });

  const transformer = new TransformStream({ transform });

  trackProcessor.readable
    .pipeThrough(transformer)
    .pipeTo(trackGenerator.writable);

  return trackGenerator;
}

function cleanStream() {
  return function transform(frame, controller) {
    controller.enqueue(frame);
  }
}

function showText({
  text,
  txtInitialX,
  txtColor = 'white',
  txtFontSize = '48px',
  txtFont = 'serif',
  textSpeed = 2,
  bgColor = '#9c28b8',
  bgPadding = 10,
  position = 'top'
}) {
  const canvas = new OffscreenCanvas(1, 1);
  const ctx = canvas.getContext('2d');
  const intTxtFontSize = parseInt(txtFontSize);

  let x = txtInitialX;

  return function transform(frame, controller) {
    const width = frame.displayWidth;
    const height = frame.displayHeight;
    canvas.width = width;
    canvas.height = height;

    const bgHeight = intTxtFontSize + bgPadding;
    const bgPositionY = position === 'bottom'
      ? height - (intTxtFontSize + bgPadding + 5)
      : 5;
    const txtPositionY = position === 'bottom'
      ? height - (intTxtFontSize + Math.floor(bgPadding / 2) + 5)
      : 5 + intTxtFontSize;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(frame, 0, 0, width, height);
    ctx.font = txtFontSize + ' ' + txtFont;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, bgPositionY, width, bgHeight)
    ctx.fillStyle = txtColor;
    ctx.fillText(text, x, txtPositionY);

    x -= textSpeed;
    if (x <= (0 - 100 - text.length * 20)) {
      x = width
    }

    const newFrame = new VideoFrame(canvas, { timestamp: frame.timestamp });

    frame.close();
    controller.enqueue(newFrame);
  }
}