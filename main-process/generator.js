const { ipcMain } = require("electron");
const fs = require("fs");
const ytdl = require('@distube/ytdl-core');
const fullPath = (fileName, ext) => `C:\\Users\\Cedric\\Downloads\\${fileName}.${ext}`;
const SUCCESS = "Stream successfully generated.";

ipcMain.on("form:submit", async (event, url, audioOnly) => {
  try {
    await generate(url, audioOnly, event);
  } catch (err) {
    event.reply("file:error", err.message);
  }
});

async function generate(url, audioOnly, event) {
  if (ytdl.validateURL(url)) {
    try {
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[^a-zA-Z ]/g, "");
      const ext = audioOnly ? 'm4a' : 'mp4';
      const options = {
        filter: audioOnly ? 'audioonly' : 'audioandvideo',
        quality: audioOnly ? 'highestaudio' : 'highestvideo',
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36' // Utiliser un User-Agent pour éviter des erreurs de connexion
          }
        }
      };

      const fileStream = fs.createWriteStream(fullPath(title, ext));
      fileStream.on('finish', () => {
        event.reply("file:success", SUCCESS);
      });
      fileStream.on('error', (error) => {
        event.reply("file:error", error.message);
      });

      const downloadStream = ytdl(url, options);
      downloadStream.on('progress', (chunkLength, currentDownloaded, total) => {
        const progress = (currentDownloaded / total) * 100;
        event.reply("file:progress", progress);
      });

      downloadStream.on('error', (error) => {
        event.reply("file:error", error.message);
      });

      downloadStream.pipe(fileStream);
    } catch (error) {
      event.reply("file:error", error.message);
    }
  } else {
    event.reply("file:error", "URL non valide");
  }
}