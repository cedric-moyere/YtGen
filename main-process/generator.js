const { ipcMain } = require("electron");
const fs = require("fs");
const ytdl = require('ytdl-core');
const fullPath = fileName => `C:\\Users\\Cedric\\Downloads\\${fileName}.mp4`;
const SUCCESS = "";

ipcMain.on("form:submit", async (event, url) => {
  try {
    await generate(url);
    event.reply("file:success", SUCCESS);
  } catch (err) {
    console.log(err);
    event.reply("file:error", err);
  }
});

async function generate(url) {
  fs.writeFile('C:/Users/Cedric/Downloads/test.txt', JSON.stringify(await ytdl.getInfo(url)), err => {
    if (err) {
      console.error(err);
    }
  });
  console.log(await ytdl.getInfo(url))
  if(ytdl.validateURL(url)){
    const title = (await ytdl.getInfo(url)).videoDetails.title;
    const pureTitle = title.replace(/[^a-zA-Z ]/g, "");
    ytdl(url, {
      format: 'mp3',
      filter: 'audioonly',
    }).pipe(fs.createWriteStream(fullPath(pureTitle)));
  }else{
    throw("Unable to parse URL");
  }
}