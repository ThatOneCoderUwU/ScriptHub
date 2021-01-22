let contentcontainer = document.getElementsByClassName('contentcontainer')[0];

let container;
let containerContentCount = 0;

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

let cardCallBacks = [];
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

	cardCallBacks[id] = options.callback;

	let el = document.createElement('div');
	el.className = 'col s12 m6';
	el.innerHTML = `
      <div class="card blue-grey darken-1">
        <div class="card-content white-text">
          <span class="card-title">${options.title}</span>
          <p>${options.description}</p>
        </div>
        <div class="card-action">
          <a onclick="cardCallBacks[${id}]()" id="InstallButton-${
		options.name || id.toString()
	}">${options.text || 'Install'}</a>
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
