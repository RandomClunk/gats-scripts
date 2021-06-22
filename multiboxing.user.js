// ==UserScript==
// @name        gats.io multiboxing
// @match       gats.io
// @run-at      document-start
// @grant       none
// ==/UserScript==

const channel = new BroadcastChannel('GM');


channel.addEventListener('message', ({ data }) => {
  if(!syncing) return;

  try {
    RF.list[0].send(data);
  } catch(e) {
    delete e;
  }
});

let syncing = false;

window.addEventListener('load', () => {
  const status = document.body.appendChild(document.createElement('div'));

  status.style.position = 'absolute';
  status.style.right = '0';
  status.style.top = '0';
  status.innerText = 'false';
  status.style.zIndex = 99999;

  $(document).on('keypress', ({ key }) => {
    if(j46 || key !== 'q') return;

    syncing = !syncing;

    status.innerText = syncing + '';
  });

  window.a59 = function(name, data) {
    const string = a60(name, data);

    data = a66(string);

    if(name !== 'ping' && syncing) channel.postMessage(data);

    return data;
  };
});
