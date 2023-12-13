const { ipcMain } = require("electron");
const fs = require("fs");
const ytdl = require('ytdl-core');
const fullPath = (fileName, ext) => `C:\\Users\\Cedric\\Downloads\\${fileName}.${ext}`;
const SUCCESS = "";

ipcMain.on("form:submit", async (event, url, audioOnly) => {
  try {
    await generate(url, audioOnly);
    event.reply("file:success", SUCCESS);
  } catch (err) {
    event.reply("file:error", err);
  }
});

async function generate(url, audioOnly) {
  if(ytdl.validateURL(url)){
  const title = (await ytdl.getInfo(url)).videoDetails.title;
    const pureTitle = title.replace(/[^a-zA-Z ]/g, "");
    const ext = audioOnly ? 'm4a' : 'mp4'
    ytdl(url, {
      filter: audioOnly ? 'audioonly' : 'audioandvideo',
    }).pipe(fs.createWriteStream(fullPath(pureTitle, ext)));
  }else{
    throw("Unable to parse URL");
  }
}