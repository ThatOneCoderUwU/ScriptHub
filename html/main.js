const { ipcRenderer } = require('electron');
const log = (...a) => {
	ipcRenderer.sendSync('log', ...a);
};

log('Initializing Main JS file');

const axios = require('axios');

const getInstaller = id => {
	return () => {
		const options = cardOptions[id];
		try {
			axios({
				method: 'get',
				url: options.url,
				responseType: 'stream',
			}).then(response => {
				if (!ipcRenderer.sendSync('getScriptDir')) {
					ipcRenderer.sendSync('select-dir');
				}
				ipcRenderer.sendSync('save-script', options.filename, response.data);
				M.toast({
					html: 'Downloaded Script!',
				});
			});
		} catch (error) {
			M.toast({
				html:
					'An error has occured while downloading a script! Check the console for more information.',
			});
			ipcRenderer.sendSync('log_error', error);
			throw new Error(error);
		}
	};
};

let cardCallBacks = [];
let cardOptions = [];
let contentcontainer = document.getElementsByClassName('contentcontainer')[0];

let container;
let containerContentCount = 0;

const SetDir = () => {
	ipcRenderer.sendSync('select-dir');
};

const genCont = () => {
	container = document.createElement('div');

	container.id = 'tmpId';
	container.className = 'row';

	contentcontainer.appendChild(container);

	container = document.getElementById('tmpId');
	container.id = '';
	containerContentCount = 0;
};
genCont();

const genCard = options => {
	/*
    Options Template:
    {
      title: "Title",
      description: "Description",
      name: "Internal_Name_Without_Spaces",
      text: "Install_Button_Text"
    }
  */

	let id = cardCallBacks.length + 1;
	containerContentCount++;

	cardCallBacks[id] = options.callback || getInstaller(id);
	cardOptions[id] = options;

	let el = document.createElement('div');
	el.className = 'col s12 m6';
	el.innerHTML = `
      <div class="card ${options.colour || 'purple'} darken-1">
        <div class="card-content white-text">
          <span class="card-title">${options.title}</span>
          <p>${options.description}</p>
        </div>
        <div class="card-action">
          <a onclick="cardCallBacks[${id}](${id})" id="InstallButton-${
		options.name || id.toString()
	}">${options.text || 'Install/Update'}</a>
        </div>
      </div>`;
	el.id = 'getTmp';

	container.appendChild(el);

	el = document.getElementById('getTmp');
	el.id = '';

	if (containerContentCount == 2) {
		genCont();
	}

	el.SetButtonText = text => {
		document.getElementById(`InstallButton-${options.name}`).innerText = text;
	};

	return el;
};

log(`Getting Scripts.JSON`);
axios({
	method: 'get',
	url:
		'https://raw.githubusercontent.com/ThatOneCoderUwU/ScriptHub/main/Scripts.json',
	responseType: 'stream',
}).then(response => {
	log(`Got Scripts.JSON - Looping over Scripts`);
	// response.data.pipe(fs.createWriteStream('ada_lovelace.jpg'));
	response.data.forEach(element => {
		log(`Generating Card for Element ${element.name}`);
		genCard(element);
	});
	log(`Removing Loader...`);
	document.getElementById('loader').remove();
});
