/*const payload = JSON.stringify({ game: 'gats.io' });

function getServerList() {
  return fetch('https://io-8.com/find_instances', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: payload
  }).then(response => response.json());
}

const siteKey = '6LenZt4ZAAAAAF-2nPKzH9111gkjBlaJCEp8UsQV';

async function generateToken(type) {
  const token = await grecaptcha.execute(siteKey, { action: type } );
  
  return { token, timestamp: Date.now() };
}



//const servers = await getServerList();

for (const { url, city, game_type: gameType} of servers.filter(s => s.game_type === 'DOM')) {
  const ws = new WebSocket(`wss://${url}`);
  
  ws.binaryType = 'arraybuffer';
  
  ws.addEventListener('open', () => {
    console.log(`[${city}: ${gameType}] connected`);
  });
  
  ws.addEventListener('close', () => {
    console.log(`[${city}: ${gameType}] disconnected`);
  });
  
  ws.addEventListener('message', async ({ data }) => {
    const msg = decoder.decode(data);
    
    if (msg === '+') {
      console.log(`[${city}: ${gameType}] captcha requested`);
      
      const { token, timestamp } = await generateToken('connect');
      
      ws.send(encoder.encode(`q,${token},${timestamp}\0`));
      
      ws.send(encoder.encode('.'));
      
      setTimeout(() => {
        ws.send(encoder.encode('s,0,0,0\0'));
      }, 2000);
      
      return;
    }
    
    if (msg === '.') return ws.send(encoder.encode('.'));
    
    const chunks = msg.split('|');
    
    for (const chunk of chunks) {
      if (!chunk.startsWith('v')) continue;
      
      const parts = chunk.split(',');
      
      for (let i = 1; i < parts.length; i++) {
        const items = parts[i].split('.');
        
        if (items[0].startsWith('#')) continue;
        
        console.log({
          name: items[0],
          score: parseInt(items[2]),
          kills: parseInt(items[3]),
          teamCode: parseInt(items[4]),
          city,
          gamemode: gameType
        });
      }
    }
  });
}

*/


const siteKey = '6LenZt4ZAAAAAF-2nPKzH9111gkjBlaJCEp8UsQV';

async function generateToken(type) {
  const token = await grecaptcha.execute(siteKey, { action: type } );
  
  return { token, timestamp: Date.now() };
}

function Enum(values) {
  const object = {},
    length = values.length;

  for (let i = 0; i < length; i++) object[object[i] = values[i]] = i;

  return object;
}

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
    
    if(callbacks) for (const callback of callbacks) callback(...data);
  }
}

const payload = JSON.stringify({ game: 'gats.io' });

const GUNS = Enum([
  'PISTOL',
  'SMG',
  'SHOTGUN',
  'ASSAULT',
  'SNIPER',
  'LMG'
]);

const ARMOR_AMOUNTS = Enum([
  'NONE',
  'LIGHT',
  'MEDIUM',
  'HEAVY'
]);

const COLORS = Enum([
  'RED',
  'ORANGE',
  'YELLOW',
  'GREEN',
  'BLUE',
  'PINK'
]);

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getServerList() {
  return fetch('https://io-8.com/find_instances', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: payload
  }).then(response => response.json());
}

function parseChunk(chunk) {
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
        spdY: parseFloat(parts[5] / 10)
      };
    }
    
    case 'c': {
      return {
        code: parts[0],
        id: parts[1],
        invincible: parts[11] === '1',
      };
    }
    
    case 'd': {
      return {
        code: parts[0],
        id: parseInt(parts[1]),
        x: parseFloat(parts[4] / 10),
        y: parseFloat(parts[5] / 10),
        username: parts[11],
        invincible: parts[13] === '1',
        teamCode: parseInt(parts[16])
      };
    }
    
    case 'sta': {
      return {
        code: parts[0]
      };
    }
    
    case 'f': {
      return {
        code: parts[0],
        currentBullets: parts[1],
        score: parts[2],
        kills: parts[3],
        rechargeTimer: parts[4],
        maxBullets: parts[5],
        numExplosivesLeft: parts[8]
      };
    }
    
    case 'p': {
      return {
        code: parts[0],
        level: parseInt(parts[1])
      };
    }
  }
}

class Client extends EventEmitter {
  constructor({
    url,
    autoReconnect = false,
    autoReconnectDelay = 5000,
    autoRespawn = false,
    autoRespawnDelay = 5000
  }) {
    super();
    
    this.url = url;
    
    this.autoReconnect = autoReconnect;
    this.autoReconnectDelay = autoReconnectDelay;
    
    this.autoRespawn = autoRespawn;
    this.autoRespawnDelay = autoRespawnDelay;
    
    this.reset();
    
    this.connected = false;
    
    this.ws = null;
    
    this.id = null;
    
    this.players = {};
  }
  
  connect() {
    const ws = new WebSocket(`wss://${this.url}`);
    
    ws.addEventListener('open', () => {
      this.connected = true;
      
      this.sendPing();
      
      this.emit('connect');
    });
    
    ws.addEventListener('close', e => {
      this.reset();
      
      this.connected = false;
      
      this.ws = null;
      
      this.id = null;
      
      this.players = {};
      
      if (this.autoReconnect) setTimeout(() => {
        this.connect();
      }, this.autoReconnectDelay);
      
      this.emit('disconnect', e);
    });
    
    ws.addEventListener('error', err => {
      this.emit('error', err);
    });
    
    ws.addEventListener('message', async ({ data }) => {
      const msg = decoder.decode(data);
      
      if (msg === '.') {
        this.sendPing();
        
        this.emit('pong');
        
        return;
      }
      
      if (msg === '+') {
        const { token, timestamp } = await generateToken('connect');
        
        this.send(`q,${token},${timestamp}`);
        
        return;
      }
      
      const chunks = msg.split('|');
      
      for (const chunk of chunks) {
        const parts = parseChunk(chunk);
        
        if (!parts) continue;
        
        switch (parts.code) {
          case 'a': {
            this.id = parts.id;
            
            this.x = parts.x;
            this.y = parts.y;
            
            this.username = parts.username;
            
            this.teamCode = parts.teamCode;
            
            this.players = {};
            
            this.emit('spawn', parts);
            
            break;
          }
          
          case 'b': {
            if (parts.id === this.id) {
              this.x = parts.x;
              this.y = parts.y;
              
              this.spdX = parts.spdX;
              this.spdY = parts.spdY;
              
              this.angle = parts.angle;
              
              this.emit('update', parts); 
            } else if (this.players.hasOwnProperty(parts.id)) {
              const player = this.players[parts.id];
              
              player.x = parts.x;
              player.y = parts.y;
            }
            
            break;
          }
          
          case 'c': {
            if (parts.id === this.id) break;
            
            if (this.players.hasOwnProperty(parts.id))
              this.players[parts.id].invincible = parts.invincible;
            
            break;
          }
          
          case 'd': {
            if(parts.id === this.id) break;
            
            const [
              ,
              clan = '',
              username
            ] = parts.username.match(/(?:\[(.+)])? ?(.+)/);
            
            this.players[parts.id] = {
              id: parts.id,
              x: parts.x,
              y: parts.y,
              clan,
              username,
              invincible: parts.invincible,
              teamCode: parts.teamCode
            };
            
            break;
          }
          
          case 'e': {
            delete this.players[parts.id];
            
            break;
          }
          
          case 'sta': {
            this.reset();
            
            this.emit('death');
            
            break;
          }
          
          case 'f': {
            break; // to do
            
            this.score = parts.score;
            this.kills = parts.kills;
            this.rechargeTimer = parts.rechargeTimer;
            this.numExplosivesLeft = parts.numExplosivesLeft;
            
            this.emit('metaUpdate', parts);
            
            break;
          }
          
          case 'p': {
            this.level = parts.level;
            
            this.emit('level', parts.level);
          }
        }
      }
      
      this.emit('message', data, msg);
    });
    
    ws.binaryType = 'arraybuffer';
    
    this.ws = ws;
  }
  
  reset() {
    this.x = this.y = this.username = this.teamCode = null;
  }
  
  send(msg) {
    if(this.ws && this.ws.readyState === 1) this.ws.send(encoder.encode(msg));
  }
  
  sendPing() {
    this.send('.');
  }
  
  spawn(gun, armor, color) {
    this.send(`s,${gun},${armor},${color}`);
  }
  
  sendInput(id, state) {
    this.send(`k,${id},${state}`);
  }
  
  moveLeft(moving = true) {
    if (moving) {
      this.sendInput(0, 1);
      
      this.moveRight(false);
    } else this.sendInput(0, 0);
  }
  
  moveRight(moving = true) {
    if (moving) {
      this.sendInput(1, 1);
      
      this.moveLeft(false);
    } else this.sendInput(1, 0);
  }
  
  moveUp(moving = true) {
    if (moving) {
      this.sendInput(2, 1);
      
      this.moveDown(false);
    } else this.sendInput(2, 0);
  }
  
  moveDown(moving = true) {
    if (moving) {
      this.sendInput(3, 1);
      
      this.moveUp(false);
    } else this.sendInput(3, 0);
  }
  
  stopMoving() {
    this.moveLeft(false);
    this.moveRight(false);
    
    this.moveUp(false);
    this.moveDown(false);
  }
  
  setChatting(chatting = true) {
    this.sendInput(7, chatting ? 1 : 0);
  }
  
  chat(msg) {
    this.send(`c,${msg}`);
  }
  
  setAngle(angle = 0) {
    this.send(`m,5000,5000,${angle}`);
  }
  
  setShooting(shooting = true) {
    this.sendInput(6, shooting ? 1 : 0);
  }
  
  upgrade(id, level) {
    this.send(`u,${id},${level}`);
  }
}

const bots = [];

const dallasDomUrl = servers.find(
  server => server.city === 'Dallas' && server.game_type === 'DOM'
).url;

for (let i = 0; i < 5; i++) {
  const bot = new Client({
    url: dallasDomUrl,
    autoReconnect: true,
    autoReconnectDelay: 5000
  });
  
  bot.on('connect', () => {
    bot.spawn(GUNS.SNIPER, ARMOR_AMOUNTS.NONE, COLORS.RED);
  });
  
  bot.on('spawn', () => {
	if (bot.teamCode != RD.pool[c3].teamCode) bot.ws.close();
  });
  
  bot.on('death', () => {
    bot.spawn(GUNS.SNIPER, ARMOR_AMOUNTS.NONE, COLORS.RED);
  });
  
  bot.on('level', level => {
    if(level === 1) bot.upgrade(7, 1);
    if(level === 2) bot.upgrade(14, 2);
    if(level === 3) bot.upgrade(9, 3);
  });
  
  bot.connect();
  
  bots.push(bot);
}

Math.dist2 = (p1, p2) => {
  const distX = p1.x - p2.x, distY = p1.y - p2.y;
  
  return distX * distX + distY * distY;
};

let moveInt = setInterval(() => {
  if (!spawned) return;
  
  for (const bot of bots) {
    /*const { x2, y2 } = RD.pool[c3];
    const { x, y } = bot;
    
    const dx = x - x2, dy = y - y2;
    
    if(dx === 0) {
      bot.moveLeft(false);
      bot.moveRight(false);
    } else if(dx < 0) {
      bot.moveRight();
    } else if(dx > 0) {
      bot.moveLeft();
    }
    
    if(dy === 0) {
      bot.moveUp(false);
      bot.moveDown(false);
    } else if(dy < 0) {
      bot.moveDown();
    } else if(dy > 0) {
      bot.moveUp();
    }*/
    
    if(Math.dist2(RD.pool[c3], bot) < 30000) {
      bot.stopMoving();
      
      continue;
    };
    
    let angle = Math.angle(bot, RD.pool[c3]) * Math.RADS2DEGS;
    
    if(angle < 0) angle += 360;
    
    //[1,3,5,7].map(x => bot.sendInput(x % 5, (8 + x - angle / 45 + 0.5 | 0) % 8 < 3 & (angle - angle) ** 2 < 99));
    
    if(angle >= 0 && angle <= 180) bot.moveDown();
    if(angle >= 180 && angle <= 360) bot.moveUp();
    if(angle >= 90 && angle <= 270) bot.moveLeft();
    if(angle <= 90 || angle >= 270) bot.moveRight();
  }
}, 500);

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
    if (!bot.username) continue;
    
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

$(document).on('mousemove', () => {
  if(!spawned) return;
  
  for (const bot of bots) bot.setAngle(RD.pool[c3].playerAngle);
});

$(document).on('mousedown', e => {
  if(!spawned) return;
  
  if(e.which === 3) for (const bot of bots) bot.setShooting();
});

$(document).on('mouseup', e => {
  if(!spawned) return;
  
  if(e.which === 3) for (const bot of bots) bot.setShooting(false);
});

$(document).on('keypress', e => {
  if(chatting) return;
  
  if(e.key === 't') for (const bot of bots) {
    bot.sendInput(5, 1);
        
    setTimeout(() => {
      bot.sendInput(5, 0);
    }, 1000);
  }
});
