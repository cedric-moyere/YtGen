const { ipcRenderer } = require("electron");

class Generator extends HTMLElement {
  url;
  audioOnly;
  spinner;
  errMsg;
  successMsg;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    fetch("./sections/generator.html")
      .then((stream) => stream.text())
      .then((html) => this.defineComponent(html));

    ipcRenderer.on("file:success", (er, success) => {
      this.spinner.hidden = true;
      this.errMsg.hidden = true;
      this.errMsg.value = '';
      this.successMsg.hidden = false;
    });

    ipcRenderer.on("file:error", (er, err) => {
      this.spinner.hidden = true;
      this.successMsg.hidden = true;
      this.errMsg.innerText = err;
      this.errMsg.hidden = false;
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
    this.spinner = this.shadowRoot.querySelector("#spinner");
    this.spinner.hidden = true;
    const form = this.shadowRoot.querySelector("#gen-form");
    form.addEventListener("submit", (e) => this.submitForm(e));
    const clearBtn = this.shadowRoot.querySelector("#clearBtn");
    clearBtn.addEventListener("click", (e) => this.clearUrl(e));
    const pasteBtn = this.shadowRoot.querySelector("#pasteBtn");
    pasteBtn.addEventListener("click", (e) => this.pasteFromClipboard(e));
    this.url = this.shadowRoot.querySelector("#url");
    this.audioOnly = this.shadowRoot.querySelector("#switchAudioOnly");
    this.successMsg = this.shadowRoot.querySelector("#successElem");
    this.successMsg.hidden = true;
    this.errMsg = this.shadowRoot.querySelector("#errElem");
    this.errMsg.hidden = true;
  }

  submitForm(e) {
    e.preventDefault();
    this.spinner.hidden = false;
    ipcRenderer.send("form:submit", this.url.value, this.audioOnly.checked);
  }

  clearUrl(e){
    e.preventDefault();
    this.url.value = '';
    this.successMsg.hidden = true;
    this.errMsg.hidden = true;
    this.errMsg.value = '';
  }

  pasteFromClipboard(e) {
    e.preventDefault();
    navigator.clipboard.readText().then((text) => {
      this.url.value = text;
    }).catch((error) => {
      console.error('Erreur lors de la récupération du presse-papiers : ', error);
    });
  }
}

customElements.define("x-generator", Generator);
