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

const GatsJS = (() => {
  let exports = {};
  
  const payload = JSON.stringify({ game: 'gats.io' });
  
  function getServerList() {
    return fetch('https://io-8.com/find_instances', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload
    }).then(response => response.json());
  }
  
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
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
  
  class Client extends EventEmitter {
    constructor(url) {
      super();
      
      this.url = url;
    }
  }
  
  exports = {
    payload,
    getServerList,
    encoder,
    decoder,
    GUNS,
    ARMOR_AMOUNTS,
    COLORS
  };
  
  return exports;
})();

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
  constructor() {
    super();
    
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
    if(this.ws && this.ws.readyState === 1) this.ws.send(encoder.encode(msg));
  }
  
  connect(region, gamemode) {
    const url = `${region}-${gamemode}.gats.io`;
    
    const ws = new WebSocket(`wss://${url}`, {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Host': url,
        'Origin': 'https://gats.io',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36'
      }
    });
    
    ws.on('open', () => {
      this.connected = true;
      
      this.region = region;
      this.gamemode = gamemode;
      
      this.sendPing();
      
      this.emit('connect');
    });
    
    ws.on('close', e => {
      this.ws = null;
      
      this.connected = false;
      
      this.region = null;
      this.gamemode = null;
      
      this.id = null;
      
      this.reset();
      
      this.emit('disconnect', e);
    });
    
    ws.addEventListener('error', err => {
      this.emit('error', err);
    });
    
    ws.addEventListener('message', e => {
      const msg = decoder.decode(e.data);
      
      if(msg === '.') {
        this.sendPing();
        
        this.emit('pong', e);
      }
      
      const chunks = msg.split('|');
      
      for (const chunk of chunks) {
        const parts = parseChunk(chunk);
        
        if(!parts) continue;
        
        switch (parts.code) {
          case 'a': {
            this.id = parts.id;
            
            this.x = parts.x;
            this.y = parts.y;
            
            this.username = parts.username;
            
            this.teamCode = parts.teamCode;
            
            this.emit('spawn', parts);
            
            break;
          }
          
          case 'b': {
            if(parts.id === this.id) {
              this.x = parts.x;
              this.y = parts.y;
              
              this.spdX = parts.spdX;
              this.spdY = parts.spdY;
              
              this.angle = parts.angle;
              
              this.emit('update', parts); 
            } else if(players.hasOwnProperty(parts.id)) {
              const player = players[parts.id];
              
              player.x = parts.x;
              player.y = parts.y;
            }
            
            break;
          }
          
          case 'c': {
            if(parts.id === this.id) break;
            
            if(players.hasOwnProperty(parts.id)) players[parts.id].invincible = parts.invincible;
            
            break;
          }
          
          case 'd': {
            if(parts.id === this.id) break;
            
            const [ , clan = '', username ] = parts.username.match(/(?:\[(.+)])? ?(.+)/);
            
            players[parts.id] = {
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
            delete players[parts.id];
            
            break;
          }
          
          case 'sta': {
            this.reset();
            
            this.emit('death');
            
            break;
          }
          
          case 'f': {
            break;
            
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
      
      this.emit('message', e);
    });
    
    ws.binaryType = 'arraybuffer';
    
    this.ws = ws;
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
    if(moving) {
      this.sendInput(0, 1);
      
      this.moveRight(false);
    } else this.sendInput(0, 0);
  }
  
  moveRight(moving = true) {
    if(moving) {
      this.sendInput(1, 1);
      
      this.moveLeft(false);
    } else this.sendInput(1, 0);
  }
  
  moveUp(moving = true) {
    if(moving) {
      this.sendInput(2, 1);
      
      this.moveDown(false);
    } else this.sendInput(2, 0);
  }
  
  moveDown(moving = true) {
    if(moving) {
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
    this.send(`m,${random(-500, 500)},${random(-500, 500)},${angle}`);
  }
  
  setShooting(shooting = true) {
    this.sendInput(6, shooting ? 1 : 0);
  }
  
  upgrade(id, level) {
    this.send(`u,${id},${level}`);
  }
}

const bots = [];

function makeBot(opts) {
  const { region, gamemode, gun, armor, color } = opts;
  
  const bot = new Client();
  
  bot.on('error', e => {
    void e;
  });
  
  bot.on('connect', () => {
    bot.spawn(gun, armor, color);
  });
  
  bot.on('disconnect', () => {
    setTimeout(() => {
      bot.connect(region, gamemode);
    }, 5000);
  });
  
  bot.on('death', () => {
    setTimeout(() => {
      bot.spawn(gun, armor, color);
    }, 3000);
  });
  
  bot.on('level', level => {
    if(level === 1) bot.upgrade(9, 1);
    if(level === 2) bot.upgrade(17, 2);
  });
  
  bot.connect(region, gamemode);
  
  bots.push(bot);
}

let player = { x: 0, y: 0, angle: 0 };
let attack = false;

wss.on('connection', ws => {
  ws.on('message', data => {
    data = JSON.parse(data);
    
    switch (data.action) {
      case 'add': {
        makeBot(data);
        
        break;
      }
      
      case 'attack true': {
        attack = true;
        
        for (const bot of bots) if(bot.username) bot.chat('ATTACK: ON');
        
        break;
      }
      
      case 'attack false': {
        attack = false;
        
        for (const bot of bots) if(bot.username) {
          bot.chat('ATTACK: OFF');
          bot.setShooting(false);
        }
        
        break;
      }
      
      case 'disconnect all': {
        for (const bot of bots) if(bot.ws) bot.ws.close();
        
        break;
      }
      
      case 'disconnect all not on team': {
        for (const bot of bots) if(bot.teamCode && bot.teamCode !== data.teamCode) if(bot.ws) bot.ws.close();
        
        break;
      }
      
      case 'restart': {
        process.exit();
        
        break;
      }
      
      case 'get info': {
        ws.send(JSON.stringify(bots.map(({
          connected,
          id,
          teamCode,
          username,
          x,
          y
        }) => {
          return {
            connected,
            id,
            teamCode,
            username,
            x,
            y
          };
        })))
        
        break;
      }
      
      case 'set player': {
        player = data.player;
        
        break;
      }
      
      case 'set angle': {
        player.angle = data.angle;
        
        if(!attack) for (const bot of bots) bot.setAngle(data.angle);
        
        break;
      }
      
      case 'fire true': {
        if(attack) break;
        
        for (const bot of bots) bot.setShooting();
        
        break;
      }
      
      case 'fire false': {
        if(attack) break;
        
        for (const bot of bots) bot.setShooting(false);
        
        break;
      }
      
      case 'chat': {
        for (const bot of bots) bot.chat(data.message);
        
        break;
      }
      
      case 'space': {
        for (const bot of bots) bot.sendInput(5, 1);
        
        setTimeout(() => {
          for (const bot of bots) bot.sendInput(5, 0);
        }, 1000);
        
        break;
      }
    }
  });
});

Math.RADS2DEGS = 180 / Math.PI;
Math.DEGS2RADS = Math.PI / 180;

Math.dist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);
Math.dist2 = (p1, p2) => {
  const distX = p1.x - p2.x, distY = p1.y - p2.y;
  
  return distX * distX + distY * distY;
};

Math.angle = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

let moveInt = setInterval(() => {
  for (const bot of bots) {
    if(!bot.username) continue;
    
    if(Math.dist2(player, bot) < 60000) {
      bot.stopMoving();
      
      continue;
    };
    
    let angle = Math.angle(bot, player) * Math.RADS2DEGS;
    
    if(angle < 0) angle += 360;
    
    //[1,3,5,7].map(x => bot.sendInput(x % 5, (8 + x - angle / 45 + 0.5 | 0) % 8 < 3 & (angle - angle) ** 2 < 99));
    
    if(angle >= 0 && angle <= 180) bot.moveDown();
    if(angle >= 180 && angle <= 360) bot.moveUp();
    if(angle >= 90 && angle <= 270) bot.moveLeft();
    if(angle <= 90 || angle >= 270) bot.moveRight();
  }
}, 100);

let whitelist = ['Randomness'];

let attackInt = setInterval(() => {
  if(!attack) return;
  
  const botIds = bots.map(b => b.id);
  
  for (const bot of bots) {
    if(!bot.username) {
      continue;
    }
    
    const filteredPlayers = Object.values(players).filter(p => {
      return (!p.invincible) &&
        (p.teamCode !== bot.teamCode) &&
        (!botIds.includes(p.id)) &&
        (!whitelist.includes(p.username))
    });
    
    const closestPlayer = filteredPlayers.sort((p1, p2) => Math.dist2(p1, bot) - Math.dist2(p2, bot))[0];
    
    if(!closestPlayer) {
      bot.setShooting(false);
      
      bot.setAngle(player.angle);
      
      continue;
    }
    
    let angle = Math.angle(bot, closestPlayer) * Math.RADS2DEGS;
    
    if(angle < 0) angle += 360;
    
    bot.setAngle(angle);
    bot.setShooting(true);
  }
}, 200);

/*if(angle === 0) this.moveRight();
if(angle === 90) this.moveDown();
if(angle === 180) this.moveLeft();
if(angle === 270) this.moveUp();
if(angle === 45) {
  this.moveRight();
  this.moveDown();
}
if(angle === 135) {
  this.moveLeft();
  this.moveDown();
}
if(angle === 225) {
  this.moveLeft();
  this.moveUp();
}
if(angle === 315) {
  this.moveRight();
  this.moveUp();
}*/
