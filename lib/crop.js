function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

/**
 * @param {string} imageSrc
 * @param {{x:number,y:number,width:number,height:number}} crop
 * @param {number} outputSize
 * @returns {Promise<Blob>}
 */
export async function getCroppedCirclePng(imageSrc, crop, outputSize = 512) {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Draw circular mask
  ctx.clearRect(0, 0, outputSize, outputSize);
  ctx.save();
  ctx.beginPath();
  ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Compute scale from natural size to crop area
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const sx = crop.x * scaleX;
  const sy = crop.y * scaleY;
  const sWidth = crop.width * scaleX;
  const sHeight = crop.height * scaleY;

  ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, outputSize, outputSize);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Failed to export image"));
      resolve(blob);
    }, "image/png");
  });
}
