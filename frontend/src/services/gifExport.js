import GIF from "gif.js";

export function exportGif(frames, options = {}) {

    const width = options.width ?? 512;
    const height = options.height ?? 512;
    const quality = options.quality ?? 10;

    return new Promise((resolve, reject) => {

        if (!frames.length) {

            reject(new Error("No frames to export."));

            return;

        }

        const gif = new GIF({

            workers: 2,

            quality,

            width,

            height,

            workerScript: "/gif.worker.js",

            background: "#000000",

        });

        let loaded = 0;

        frames.forEach(frame => {

            if (!frame.image) {

                loaded++;

                if (loaded === frames.length) {

                    gif.render();

                }

                return;

            }

            const img = new Image();

            img.crossOrigin = "anonymous";

            img.onload = () => {

                const canvas = document.createElement("canvas");

                canvas.width = width;

                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.clearRect(0, 0, width, height);

                if (frame.visible !== false) {

                    ctx.globalAlpha = frame.opacity ?? 1;

                    ctx.save();

                    ctx.translate(width / 2, height / 2);

                    ctx.rotate((frame.rotation ?? 0) * Math.PI / 180);

                    ctx.scale(frame.scale ?? 1, frame.scale ?? 1);

                    ctx.drawImage(

                        img,

                        -(img.width / 2) + (frame.x ?? 0),

                        -(img.height / 2) + (frame.y ?? 0)

                    );

                    ctx.restore();

                }

                gif.addFrame(canvas, {

                    delay: frame.duration,

                    copy: true,

                });

                loaded++;

                if (loaded === frames.length) {

                    gif.render();

                }

            };

            img.onerror = () => {

                loaded++;

                if (loaded === frames.length) {

                    gif.render();

                }

            };

            img.src = frame.image;

        });

        gif.on("finished", blob => {

            resolve(blob);

        });

    });

}