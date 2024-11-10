const { ipcRenderer } = require("electron");

class Generator extends HTMLElement {
  url;
  audioOnly;
  progressBar;
  alertMsg;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    fetch("./sections/generator.html")
      .then((stream) => stream.text())
      .then((html) => {
        this.defineComponent(html);
      })

    ipcRenderer.on('file:progress', (event, progress) => {
      this.progressBar.value = progress;
    });

    ipcRenderer.on("file:success", (er, success) => {
      this.progressBar.hidden = true;
      this.alertMsg.classList.remove("alert-info");
      this.alertMsg.classList.add("alert-success");
      this.alertMsg.innerText = success;
    });

    ipcRenderer.on("file:error", (er, err) => {
      this.progressBar.hidden = true;
      this.alertMsg.classList.add("alert-danger");
      this.alertMsg.innerText = err;
    });
  }

  defineComponent(html) {
    // Build root node
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    // Append style to root node
    const style = document.createElement("link");
    style.setAttribute("rel", "stylesheet");
    style.setAttribute("href", "./node_modules/bootstrap/dist/css/bootstrap.min.css");
    this.shadowRoot.appendChild(style);

    // Handle elem and events
    this.progressBar = this.shadowRoot.querySelector("#progressBar");
    this.progressBar.hidden = true;
    const form = this.shadowRoot.querySelector("#gen-form");
    form.addEventListener("submit", (e) => this.submitForm(e));
    const clearBtn = this.shadowRoot.querySelector("#clearBtn");
    clearBtn.addEventListener("click", (e) => this.clearUrl(e));
    const pasteBtn = this.shadowRoot.querySelector("#pasteBtn");
    pasteBtn.addEventListener("click", (e) => this.pasteFromClipboard(e));
    this.url = this.shadowRoot.querySelector("#url");
    this.audioOnly = this.shadowRoot.querySelector("#switchAudioOnly");
    this.alertMsg = this.shadowRoot.querySelector("#alertMsgElem");
    this.alertMsg.hidden = true;
  }

  submitForm(e) {
    e.preventDefault();
    this.alertMsg.hidden = false;
    this.alertMsg.classList.remove("alert-danger");
    this.alertMsg.classList.remove("alert-success");
    this.alertMsg.classList.add("alert-info");
    this.alertMsg.innerText = "Wait for the download to start...";
    this.progressBar.hidden = false;
    ipcRenderer.send("form:submit", this.url.value, this.audioOnly.checked);
  }

  clearUrl(e){
    e.preventDefault();
    this.alertMsg.hidden = true;
    this.progressBar.hidden = true;
    this.progressBar.value = 0;
    this.url.value = null;
  }

  pasteFromClipboard(e) {
    e.preventDefault();
    navigator.clipboard.readText().then((text) => {
      this.url.value = text;
    }).catch((error) => {
      this.alertMsg.classList.add("alert-danger");
      this.alertMsg.innerText = error.message;
    });
  }
}

customElements.define("x-generator", Generator);
