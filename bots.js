class EventEmitter {
  constructor() {
    this.callbacks = {};
  }
  
  on(event, callback) {
    if(!this.callbacks[event]) this.callbacks[event] = [];
    
    this.callbacks[event].push(callback);
  }
  
  emit(event, ...data){
    const callbacks = this.callbacks[event];
    
    if(callbacks) for(const callback of callbacks) callback(...data);
  }
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

class Client extends EventEmitter {
  static REGION = {
    DALLAS: 'dal',
    FRANKFURT: 'fra'
  };
  
  static GAMEMODE = {
    FFA: 'ffa',
    DOM: 'dom',
    TDM: 'tdm'
  };
  
  static GUN = {
    PISTOL: 0,
    SMG: 1,
    SHOTGUN: 2,
    ASSAULT: 3,
    SNIPER: 4,
    LMG: 5
  };
  
  static ARMOR = {
    NONE: 0,
    LIGHT: 1,
    MEDIUM: 2,
    HEAVY: 3
  };
  
  static COLOR = {
    RED: 0,
    ORANGE: 1,
    YELLOW: 2,
    GREEN: 3,
    BLUE: 4,
    PURPLE: 5 // apparently its purple and not pink
  };
  
  static parseChunk(chunk) {
    const parts = chunk.split(',');
    
    switch (parts[0]) {
      case 'a': {
        return {
          code: parts[0],
          id: parseInt(parts[1]),
          x: parseFloat(parts[4] / 10),
          y: parseFloat(parts[5] / 10),
          username: parts[18],
          teamCode: parseInt(parts[22])
        };
      }
      
      case 'b': {
        return {
          code: parts[0],
          id: parseInt(parts[1]),
          x: parseFloat(parts[2] / 10),
          y: parseFloat(parts[3] / 10),
          spdX: parseFloat(parts[4] / 10),
          spdY: parseFloat(parts[5] / 10),
          angle: parseInt(parts[6])
        };
      }
      
      case 'sta': {
        return {
          code: parts[0]
        };
      }
    }
  }
  
  constructor() {
    super();
    
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    
    this.ws = null;
    
    this.connected = false;
    
    this.region = null;
    this.gamemode = null; 
    
    this.id = null;
    
    this.reset();
  }
  
  reset() {
    this.x = this.y = this.username = this.teamCode = null;
  }
  
  send(msg) {
    if(this.connected && this.ws && this.ws.readyState === 1) this.ws.send(this.encoder.encode(msg));
  }
  
  connect(region, gamemode) {
    const ws = new WebSocket(`wss://${region}-${gamemode}.gats.io`);
    
    ws.addEventListener('open', () => {
      this.connected = true;
      
      this.region = region;
      this.gamemode = gamemode;
      
      this.ping();
      
      this.emit('connect');
    });
    
    ws.addEventListener('close', e => {
      this.emit('disconnect', e);
      
      this.ws = null;
      
      this.connected = false;
      
      this.region = null;
      this.gamemode = null;
      
      this.id = null;
      
      this.reset();
    });
    
    ws.addEventListener('error', err => {
      this.emit('error', err);
    });
    
    ws.addEventListener('message', e => {
      this.emit('message', e);
      
      const msg = this.decoder.decode(e.data);
      
      if(msg === '.') {
        this.emit('ping');
        
        this.ping();
      }
      
      const chunks = msg.split('|');
      
      for (const chunk of chunks) {
        const parts = Client.parseChunk(chunk);
        
        if(!parts) continue;
        
        switch (parts.code) {
          case 'a': {
            this.emit('spawn');
            
            this.id = parts.id;
            
            this.x = parts.x;
            this.y = parts.y;
            
            this.username = parts.username;
            
            this.teamCode = parts.teamCode;
            
            break;
          }
          
          case 'b': {
            if(parts.id !== this.id) break;
            
            this.emit('update', parts);
            
            this.x = parts.x;
            this.y = parts.y;
            
            this.spdX = parts.spdX;
            this.spdY = parts.spdY;
            
            this.angle = parts.angle;
            
            break;
          }
          
          case 'sta': {
            this.emit('death');
            
            this.reset();
          }
        }
      }
    });
    
    ws.binaryType = 'arraybuffer';
    
    this.ws = ws;
  }
  
  ping() {
    this.send('.');
  }
  
  spawn(gun, armor, color) {
    this.send(`s,${gun},${armor},${color}`);
  }
  
  moveLeft(moving = true) {
    if(moving) {
      this.send(`k,0,1`);
      
      this.moveRight(false);
    } else {
      this.send(`k,0,0`);
    }
  }
  
  moveRight(moving = true) {
    if(moving) {
      this.send(`k,1,1`);
      
      this.moveLeft(false);
    } else {
      this.send(`k,1,0`);
    }
  }
  
  moveUp(moving = true) {
    if(moving) {
      this.send(`k,2,1`);
      
      this.moveDown(false);
    } else {
      this.send(`k,2,0`);
    }
  }
  
  moveDown(moving = true) {
    if(moving) {
      this.send(`k,3,1`);
      
      this.moveUp(false);
    } else {
      this.send(`k,3,0`);
    }
  }
  
  stopMoving() {
    this.moveLeft(false);
    this.moveRight(false);
    this.moveUp(false);
    this.moveDown(false);
  }
  
  setChatting(chatting = true) {
    this.send(`k,7,${chatting ? 1 : 0}`);
  }
  
  chat(msg) {
    this.send(`c,${msg}`);
  }
  
  setAngle(angle = 0) {
    this.send(`m,${random(-500, 500)},${random(-500, 500)},${angle}`);
  }
  
  setShooting(shooting = true) {
    this.send(`k,6,${shooting ? 1 : 0}`);
  }
}

const bots = [];

let gun = Client.GUN.SNIPER;
let armor = Client.ARMOR.NONE;

function makeBot() {
  const bot = new Client();
  
  bot.on('connect', () => {
    bot.spawn(gun, armor, 0);
  });
  
  bot.on('disconnect', () => {
    setTimeout(() => {
      bot.connect(Client.REGION.DALLAS, Client.GAMEMODE.DOM);
    }, 5000);
  });
  
  bot.on('death', () => {
    setTimeout(() => {
      bot.spawn(gun, armor, 0);
    }, 3000);
  });
  
  bot.connect(Client.REGION.DALLAS, Client.GAMEMODE.DOM);
  
  bots.push(bot);
}

/*$(document).on('keypress', e => {
  if(!j46) if(e.key === 'e') {
    for (const bot of bots) {
      bot.chat('Randomness is king');
    }
  }
});*/

Math.RADS2DEGS = 180 / Math.PI;
Math.DEGS2RADS = Math.PI / 180;

Math.dist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);
Math.dist2 = (p1, p2) => {
  const distX = p1.x - p2.x, distY = p1.y - p2.y;
  
  return distX * distX + distY * distY;
};

Math.angle = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

//let msgInt = setInterval(() => {
//  for (const bot of bots) {
//    bot.chat('Random Clunk#1134');
//  }
//}, 5000);

let moveInt = setInterval(() => {
  if(!c4) return;
  
  const player = RD.pool[c3];
  
  for (const bot of bots) {
    if(!bot.username) continue;
    
    if(Math.dist2(player, bot) < 60000) {
      bot.stopMoving();
      
      continue;
    };
    
    let angle = Math.angle(bot, player) * Math.RADS2DEGS;
    
    if(angle < 0) angle += 360;
    
    if(angle >= 0 && angle <= 180) bot.moveDown();
    if(angle >= 180 && angle <= 360) bot.moveUp();
    if(angle >= 90 && angle <= 270) bot.moveLeft();
    if(angle <= 90 || angle >= 270) bot.moveRight();
  }
}, 500);

$(document).on('mousemove', () => {
  if(!c4) return;
  
  const player = RD.pool[c3];
  
  const point = {
    x: player.x + (j9[0] - innerWidth / 2),
    y: player.y + (j9[1] - innerHeight / 2)
  };
  
  for (const bot of bots) {
    if(!bot.username) continue;
    
    let angle = Math.angle(bot, point) * Math.RADS2DEGS;
    
    if(angle < 0) angle += 360;
    
    bot.setAngle(angle);
  }
  
  
});

$(document).on('mousedown', e => {
  if(!c4) return;
  
  if(e.which === 3) for (const bot of bots) bot.setShooting();
});

$(document).on('mouseup', e => {
  if(!c4) return;
  
  if(e.which === 3) for (const bot of bots) bot.setShooting(false);
});

function a56() {
	if (c9.current > 0) {
		c9.current--;
	}
	if (j37 > 0) {
		j37--;
	}
	if (j34 <= 624) {
		j34++;
	} else {
		if (o3[2] != "" && j35 <= 312) {
			j35++;
		}
	}
  
  if(!c4) return;
  
  let playerPos = c2.getRelPos(RD.pool[c3].getAttr());
  let myTeamCode = RD.pool[c3].teamCode;
  
  for (const bot of bots) {
    if(!bot.username) continue;
    
    let botPos = c2.getRelPos({
      x: bot.x,
      y: bot.y
    });
    
    j58.strokeStyle = bot.teamCode === myTeamCode ? '#00ff00' : '#ff0000';
    j58.strokeWeight = 2;
    j58.beginPath();
    j58.moveTo(botPos.x, botPos.y);
    j58.lineTo(playerPos.x, playerPos.y);
    j58.closePath();
    j58.stroke();
  }
}
