((w, d) => {
  const style = d.head.appendChild(d.createElement('style'));
  style.innerHTML = `
    #killfeed {
      position: absolute;
      left: 5px;
      bottom: 10%;
      width: 200px;
      height: 30%;
      border: 1px solid black;
      z-index: 1000;
      user-select: none;
    }
    
    .killfeed-message {
      width: 100%;
      height: 30px;
      margin-bottom: 5px;
      background-color: #58585a;
      color: white;
      font-size: 12px;
      text-align: center;
      vertical-align: middle;
      line-height: 30px;
      transition: opacity 1s linear;
    }
    
    .killfeed-message:last-child {
      margin: 0;
    }
    
    .killfeed-message a {
      color: white;
    }
    
    .killfeed-message img {
      height: 30px;
      filter: brightness(0) invert(1);
    }
    
    .resolved {
      opacity: 0;
    }
  `;
  
  const killfeed = d.body.appendChild(d.createElement('div'));
  killfeed.id = 'killfeed';
  
  window.message = function message(data) {
    const message = killfeed.appendChild(d.createElement('div'));
    
    message.classList.add('killfeed-message');
    
    const killer = d.createElement('a');
    const gun = d.createElement('img');
    const victim = d.createElement('a');
    
    switch(data.type) {
      case 'self-kill': {
        killer.innerText = 'You';
        victim.innerText = data.victim;
        
        killer.href = `http://stats.gats.io/${data.killer}`;
        victim.href = `http://stats.gats.io/${data.victim}`;
        
        killer.target = victim.target = '_blank';
        
        killer.style.color = 'yellow';
        
        gun.src = `https://gats.io/img/${data.gun}-outline.png`;
        
        message.appendChild(killer);
        message.innerHTML += ' ';
        message.appendChild(gun);
        message.innerHTML += ' ';
        message.appendChild(victim);
        
        break;
      }
      
      case 'kill': {
        killer.innerText = data.killer;
        victim.innerText = data.victim;
        
        killer.href = `http://stats.gats.io/${data.killer}`;
        victim.href = `http://stats.gats.io/${data.victim}`;
        
        killer.target = victim.target = '_blank';
        
        gun.src = `https://gats.io/img/${data.gun}-outline.png`;
        
        message.appendChild(killer);
        message.innerHTML += ' ';
        message.appendChild(gun);
        message.innerHTML += ' ';
        message.appendChild(victim);
        
        break;
      }
      
      case 'self-death': {
        killer.innerText = data.killer;
        victim.innerText = 'You';
        
        killer.href = `http://stats.gats.io/${data.killer}`;
        victim.href = `http://stats.gats.io/${data.victim}`;
        
        killer.target = victim.target = '_blank';
        
        victim.style.color = 'yellow';
        
        gun.src = `https://gats.io/img/${data.gun}-outline.png`;
        
        message.appendChild(killer);
        message.innerHTML += ' ';
        message.appendChild(gun);
        message.innerHTML += ' ';
        message.appendChild(victim);
        
        break;
      }
    }
    
    /*setTimeout(() => {
      message.classList.add('resolved');
      
      setTimeout(() => message.remove(), 1000);
    }, 4000);*/
  }
})(window, document);

message({type:'kill', victim:'SBProTeam', killer:'MatterBot', gun:'pistol'});
message({type:'self-kill', victim:'KSRandomness', killer:'Randomness', gun:'shotgun'});
message({type:'self-kill', victim:'MatterBot', killer:'Randomness', gun:'shotgun'});
message({type:'self-death', victim:'Randomness', killer:'Guest Lguana', gun:'pistol'});
