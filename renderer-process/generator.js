const { ipcRenderer } = require("electron");

class Generator extends HTMLElement {
  url;
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
    this.url = this.shadowRoot.querySelector("#url");
    this.successMsg = this.shadowRoot.querySelector("#successElem");
    this.successMsg.hidden = true;
    this.errMsg = this.shadowRoot.querySelector("#errElem");
    this.errMsg.hidden = true;
  }

  submitForm(e) {
    e.preventDefault();
    this.spinner.hidden = false;
    ipcRenderer.send("form:submit", this.url.value);
  }

  clearUrl(e){
    e.preventDefault();
    this.url.value = '';
    this.successMsg.hidden = true;
    this.errMsg.hidden = true;
    this.errMsg.value = '';
  }
}

customElements.define("x-generator", Generator);
