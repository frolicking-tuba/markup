/*eslint max-statements: "off"*/
/*eslint quotes: "off"*/

let modalElem = null;
let formElem = null;
let commentInputElem = null;
let toInputElem = null;
let fromInputElem = null;
let titleInputElem = null;
let buttonElem = null;
let overlayElem = null;
let bgImageElem = null;
let clipAreaElem = null;

let bgImage = '';

const apiEndpoint = 'http://getmarkup.com/api/annotate';
const elemPrefix = 'frolicking-tuba-modal';

const hideModal = () => {
  modalElem.parentNode.removeChild(modalElem);
  modalElem = null;
  formElem = null;
};

const submitForm = (event) => {
  event.preventDefault();

  const request = new XMLHttpRequest();

  request.open('POST', apiEndpoint, true);
  request.setRequestHeader('Content-Type', 'application/json');

  request.send(JSON.stringify({
    title: titleInputElem.value,
    comment: commentInputElem.value,
    to: toInputElem.value,
    from: fromInputElem.value,
    key: '%KEY%',
    location: location.href
  }));

  hideModal();
};

const buildBgImage = (url) => {
  bgImage = url;

  bgImageElem = document.createElement('img');
  bgImageElem.id = `${elemPrefix}-bg-image`;
  bgImageElem.src = url;

  return bgImageElem;
};

const buildOverlay = () => {
  overlayElem = document.createElement('div');
  overlayElem.id = `${elemPrefix}-overlay`;

  return overlayElem;
};

const buildModal = () => {
  modalElem = document.createElement('div');
  modalElem.id = elemPrefix;

  formElem = document.createElement('form');
  formElem.id = `${elemPrefix}-feedback`;

  titleInputElem = document.createElement('input');
  titleInputElem.id = `${elemPrefix}-title-input`;
  titleInputElem.type = 'text';
  titleInputElem.minlength = 1;
  titleInputElem.placeholder = 'Title';

  commentInputElem = document.createElement('textarea');
  commentInputElem.id = `${elemPrefix}-comment`;
  commentInputElem.minlength = 1;
  commentInputElem.placeholder = 'Enter your comments here';

  toInputElem = document.createElement('input');
  toInputElem.id = `${elemPrefix}-to-input`;
  toInputElem.type = 'text';
  toInputElem.minlength = 1;
  toInputElem.placeholder = 'Message to';

  fromInputElem = document.createElement('input');
  fromInputElem.id = `${elemPrefix}-from-input`;
  fromInputElem.type = 'text';
  fromInputElem.minlength = 1;
  fromInputElem.placeholder = 'Message from';

  const submitElem = document.createElement('input');

  submitElem.id = `${elemPrefix}-submit`;
  submitElem.type = 'submit';
  submitElem.value = 'send';

  modalElem.appendChild(formElem);
  formElem.appendChild(titleInputElem);
  formElem.appendChild(commentInputElem);
  formElem.appendChild(toInputElem);
  formElem.appendChild(fromInputElem);
  formElem.appendChild(submitElem);

  formElem.onsubmit = submitForm;

  return modalElem;
};

const takeShot = (cb) => {
  const shotData = {
    html: document.documentElement.innerHTML,
    browserWidth: window.innerWidth,
    browserHeight: window.innerHeight,
    url: location.href,
    clipX: window.scrollX,
    clipY: window.scrollY,
    clipWidth: window.innerWidth,
    clipHeight: window.innerHeight,
    userAgent: navigator.userAgent
  };

  const req = new Request('http://52.43.21.187:3000', {
    method: 'POST',
    body: JSON.stringify(shotData)
  });

  fetch(req)
    .then((response) => response.text())
    .then((response) => cb(response));
};

const startDrag = (event) => {
  if (event.which !== 1) {
    return;
  }

  event.preventDefault();

  let xPos = 0;
  let yPos = 0;
  let width = 0;
  let height = 0;

  if (!clipAreaElem) {
    clipAreaElem = document.createElement('div');
    clipAreaElem.style['background-image'] = `url("${bgImage}")`;
    clipAreaElem.id = `${elemPrefix}-clip-area`;

    document.body.appendChild(clipAreaElem);
  }

  const updateDim = () => {
    clipAreaElem.style.width = `${width}px`;
    clipAreaElem.style.height = `${height}px`;
    clipAreaElem.style.left = `${xPos}px`;
    clipAreaElem.style.top = `${yPos}px`;
  };

  const dragMove = (moveEvent) => {
    const xdiff = moveEvent.pageX - event.pageX;
    const ydiff = moveEvent.pageY - event.pageY;

    xPos = (xdiff < 0) ? moveEvent.pageX : event.pageX;
    yPos = (ydiff < 0) ? moveEvent.pageY : event.pageY;

    width = Math.abs(xdiff);
    height = Math.abs(ydiff);

    updateDim();
  };

  const dragDone = () => {
    document.removeEventListener('mouseup', dragDone);
    document.removeEventListener('mousemove', dragMove);

    modalElem.style.top = `${yPos}px`;
    modalElem.style.left = `${xPos + width}px`;

    modalElem.style.opacity = 1;
    modalElem.style.transform = 'translate(0, 0)';

    //document.body.removeChild(clipAreaElem);
    //clipAreaElem = null;
  };

  document.addEventListener('mouseup', dragDone);
  document.addEventListener('mousemove', dragMove);
};

const showModal = () => {
  takeShot((url) => {
    document.body.appendChild(buildBgImage(url));

    setTimeout(() => {
      bgImageElem.style.opacity = 1;
    });
  });

  document.body.appendChild(buildOverlay());
  document.body.appendChild(buildModal());

  overlayElem.addEventListener('mousedown', startDrag);
};

const clicked = () => {
  if (modalElem) {
    hideModal();
  } else {
    showModal();
  }
};

const buildButton = () => {
  buttonElem = document.createElement('div');
  buttonElem.id = 'frolicking-tuba-open-button';

  buttonElem.addEventListener('click', clicked);

  return buttonElem;
};

document.addEventListener('DOMContentLoaded', () => {
  const modalStyleElem = document.createElement('style');

  modalStyleElem.innerHTML = `%CSS%`;
  document.body.appendChild(modalStyleElem);

  document.body.appendChild(buildButton());
});
