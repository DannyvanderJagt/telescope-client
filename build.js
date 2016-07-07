const Fs = require('fs-extra');
const Path = require('path');

var Build = {
  paths: {
    input: {
      client: Path.join(__dirname, 'src', 'client.js'),
      browser: Path.join(__dirname, 'src', 'browser.js'),
      node: Path.join(__dirname, 'src', 'node.js'),
    },
    output: {
      base: Path.join(__dirname, 'dist'),
      node: Path.join(__dirname, 'dist', 'index.js'),
      browser: Path.join(__dirname, 'dist', 'browser.js')
    }
  },

  files: {
    client: undefined,
    browser: undefined,
    node: undefined,
  },

  start(){
    Fs.ensureDirSync(this.paths.output.base);
    this.loadClientFile();
    this.compileClient('node');
    this.compileClient('browser');
  },

  loadClientFile(){
    return this.files.client = Fs.readFileSync(this.paths.input.client, 'utf-8');
  },

  compileClient(name){
    if(!this.paths.input[name]){ return; }

    // Load the file
    var generalClient = this.files.client;
    var client = Fs.readFileSync(this.paths.input[name], 'utf-8');

    client = client.replace(/@include ?[\'\"]([\w\.]+)[\'\"]/g, (all, filename) => {
      return generalClient;
    })

    // Save the file in dist;
    Fs.writeFileSync(this.paths.output[name], client);

    console.log('Compiled the client: ' + name);
  }

}

Build.start();