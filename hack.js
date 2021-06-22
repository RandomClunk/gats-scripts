let customAngle = false;
let angle = 0;
let aimbotInt;
let factor = 30;
let zoom = 2200;
let chatInt = null;

let messages = [];

Math.RADS2DEGS = 180 / Math.PI;
Math.DEGS2RADS = Math.PI / 180;

Math.dist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

Math.angle = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

function chat(msg) {
  RF.list[0].send(`c,${msg}`);
}

function resizeCamera(width, height) {
  a1({
    width: width,
    height: typeof height !== 'undefined' ? height : width / (16 / 9)
  }); 
}

function getClosestPlayerData(p) {
  const closestPlayer =  Object.values(RD.pool)
    .filter(p => p.teamCode === 0 || p.teamCode !== RD.pool[c3].teamCode)
    .sort((p1, p2) => Math.dist(p1, p) - Math.dist(p2, p))[0];
  
  return {
    player: closestPlayer,
    distance: closestPlayer ? Math.dist(RD.pool[c3], closestPlayer) : undefined
  }
}

RD.prototype.drawBody = function (style, canCreateDiscussions) {
	if (!this.activated) {
		return;
	}
	var position = canCreateDiscussions.getRelPos(this.getAttr());
	if (!this.ghillie || this.spdX != 0 || this.spdY != 0 || this.beingHit || this.shooting) {
		if (this.isLeader) {
			style.globalAlpha = 0.3;
			style.strokeStyle = this.color.a;
			style.lineWidth = 10;
			j22(style, position.x, position.y, this.radius * 1.65);
		}
		if (this.invincible) {
			style.globalAlpha = 0.3;
		} else {
			style.globalAlpha = 1;
		}
		style.lineWidth = 2;
		style.strokeStyle = this.isPremiumMember ? "#000" : "#666";
		style.fillStyle = this.isPremiumMember ? "#000" : "#666";
		j22(style, position.x, position.y, this.radius + 1);
		style.fill();
		style.lineWidth = 1;
		style.strokeStyle = this.color.b;
		style.fillStyle = this.color.b;
		j22(style, position.x, position.y, this.radius - this.armorAmount / 10);
		style.fill();
		if (this.dashing) {
			style.strokeStyle = "#bababa";
			j21(style, position.x, position.y, position.x - this.spdX * 5, position.y - this.spdY * 5, 1);
			j21(style, position.x, position.y + 20, position.x - this.spdX * 5, position.y + 20 - this.spdY * 5, 1);
			j21(style, position.x, position.y - 20, position.x - this.spdX * 5, position.y - 20 - this.spdY * 5, 1);
			j21(style, position.x + 20, position.y, position.x + 20 - this.spdX * 5, position.y - this.spdY * 5, 1);
			j21(style, position.x - 20, position.y, position.x - 20 - this.spdX * 5, position.y - this.spdY * 5, 1);
		}
		style.lineWidth = 1;
		style.strokeStyle = this.color.a;
		style.fillStyle = this.color.a;
		j22(style, position.x, position.y, this.hpRadius + 1);
		style.fill();
		if (c37 && this.id != c3) {
			style.fillStyle = this.isPremiumMember ? "#000" : "#666";
			style.font = "bold 12px Arial";
			style.textAlign = "center";
			if (this.isPremiumMember) {
				style.globalAlpha = 0.75;
				var blockWidth = style.measureText(this.username).width;
				style.fillText(this.username, position.x - 9, position.y + this.radius * 1.75);
				drawImage(j30.vip, position.x + blockWidth / 2 - 6, position.y + this.radius * 1.75 - 9, 18, 10);
				style.globalAlpha = 1;
			} else {
				style.fillText(this.username, position.x, position.y + this.radius * 1.75);
			}
			style.textAlign = "start";
		}
		style.globalAlpha = 1;
	} else {
		if (this.id != c3 && RD.pool[c3].thermal == 1) {
			if (this.teamCode > 0 && this.teamCode == RD.pool[c3].teamCode) {
				style.strokeStyle = "#107a24";
				style.font = "bold 12px Arial";
				style.textAlign = "center";
				style.fillStyle = "#107a24";
				style.fillText(this.username, position.x, position.y + this.radius * 1.75);
				style.textAlign = "start";
			} else {
				style.strokeStyle = "#ff0000";
        style.font = "bold 12px Arial";
				style.textAlign = "center";
				style.fillStyle = "#ff0000";
				style.fillText(this.username, position.x, position.y + this.radius * 1.75);
				style.textAlign = "start";
			}
		} else {
			style.strokeStyle = "#efeff5";
		}
		style.lineWidth = 2;
		j22(style, position.x, position.y, this.radius);
		style.fillStyle = "#efeff5";
		style.fill();
	}
	if (c37) {
		var name = this.chatMessage;
		if (name == "" && this.chatBoxOpen) {
			name = "...";
		}
		if (name[name.length - 1] == " ") {
			name = name.substring(0, name.length - 1);
		}
		if (name.length > 0) {
			style.font = "bold 12px Arial";
			style.textAlign = "center";
			var targetHeight = style.measureText(name).width;
			style.globalAlpha = 0.7;
			style.fillStyle = this.isPremiumMember ? "#000" : "#7a7a7a";
			style.fillRect(position.x - targetHeight / 2 - 3, position.y + this.radius * 2.7 - 13, targetHeight + 6, 18);
			style.globalAlpha = 1;
			style.fillStyle = this.isPremiumMember ? "#deb34c" : "#FFF";
			style.fillText(name, position.x, position.y + this.radius * 2.7);
			style.textAlign = "start";
		}
	}
};

function a57(res) {
	var eventPage = c2.getRelPos(RD.pool[c3].getAttr());
	var a = eventPage.x * j6;
	var r = eventPage.y * j5;
	var from = Math.atan2(r - res.clientY, a - res.clientX) * 180 / Math.PI + 180;
	var until = Math.round(from + Math.asin(18 / Math.sqrt(Math.pow(a - res.clientX, 2) + Math.pow(r - res.clientY, 2))) * 180 / Math.PI);
	j39 = Math.sqrt(Math.pow(r - res.clientY, 2) + Math.pow(a - res.clientX, 2));
	j16 = [
		Math.round(a - res.clientX),
		Math.round(r - res.clientY),
		customAngle ? angle : Math.round(from)
	];
	RD.pool[c3].mouseAngle = Math.round(from);
	if (until > 360) {
		until = until - 360;
	} else {
		if (!until) {
			until = from;
		}
	}
	if(!customAngle) RD.pool[c3].playerAngle = until;
}

function a37() {
	if (RF.list[0] === undefined) {
		return;
	}
  if(customAngle) {
    RF.list[0].send(a59("mouse-move", {
			mouseX: j16[0],
			mouseY: j16[1],
			mouseAngle: angle
		}));
    
    RD.pool[c3].playerAngle = angle;
  } else if(!_.isEqual(j16, j15)) {
		RF.list[0].send(a59("mouse-move", {
			mouseX: j16[0],
			mouseY: j16[1],
			mouseAngle: j16[2]
		}));
		j16 = j15;
	}
}

function replayWithNames(speed) {
  let i = 0;
  let j = 0;
  let len = messages.length;
  
  let int = setInterval(function() {
    if(j === 0) {
      chat(messages[i].username);
      j++
    } else {
      chat(messages[i].message);
      i++;
      j--;
    }
    
    if(i > len) return clearInterval(int);
  }, speed);
}

function replay(speed) {
  let i = 0;
  let len = messages.length;
  
  let int = setInterval(function() {
    chat(messages[i].message);
    i++;
    
    if(i > len) return clearInterval(int);
  }, speed);
}

$(document).on('keypress', e => {
  if(j46) return;
  
  const key = e.key;
  
  if(key === '-') zoom += 100;
  if(key === '=') zoom -= 100;
  
  if(key === 'm') {
    if(chatInt !== null) {
      clearInterval(chatInt);
      chatInt = null;
    } else chatInt = setInterval(() => { chat(`Messages: ${messages.length}`); });
  }
});

$(document).on('keydown', e => {
  if(j46) return;
  
  const key = e.key;
  
  if(key === 'Shift') {
    clearInterval(aimbotInt);
    
    customAngle = true;
      
    aimbotInt = setInterval(() => {
      const { player, distance } = getClosestPlayerData({
        x: RD.pool[c3].x + (j9[0] - innerWidth / 2),
        y: RD.pool[c3].y + (j9[1] - innerHeight / 2)
      });
      
      if(!player) return;
      
      angle = Math.angle(RD.pool[c3], {
        x: player.x + player.spdX * (distance / factor),
        y: player.y + player.spdY * (distance / factor)
      }) * Math.RADS2DEGS;
      
      if(angle < 0) angle += 360;
    });
  }
});

$(document).on('keyup', e => {
  if(j46) return;
  
  const key = e.key;
  
  if(key === 'Shift') {
    clearInterval(aimbotInt);
    
    customAngle = false;
  }
});

setInterval(() => {
  if(c3) RD.pool[c3].thermal = 1;
  
  resizeCamera(zoom);
}, 1000);

RD.prototype.applyAuxUpdate = function (settings) {
	if (!this.activated) {
		return;
	}
	if (settings.currentBullets !== undefined && settings.currentBullets != "") {
		this.currentBullets = parseInt(settings.currentBullets);
	}
	if (settings.shooting !== undefined && settings.shooting != "") {
		this.shooting = parseInt(settings.shooting);
	}
	if (settings.reloading !== undefined && settings.reloading != "") {
		this.reloading = parseInt(settings.reloading);
	}
	if (settings.hp !== undefined && settings.hp != "") {
		this.hp = parseInt(settings.hp);
	}
	if (settings.beingHit !== undefined && settings.beingHit != "") {
		if (settings.id == c3) {
			j37 = 6;
		}
		this.beingHit = parseInt(settings.beingHit);
	}
	if (settings.armorAmount !== undefined && settings.armorAmount != "") {
		this.armorAmount = parseInt(settings.armorAmount);
	}
	if (settings.radius !== undefined && settings.radius != "") {
		this.radius = parseInt(settings.radius / 10);
	}
	if (settings.ghillie !== undefined && settings.ghillie != "") {
		this.ghillie = parseInt(settings.ghillie);
	}
	if (settings.maxBullets !== undefined && settings.maxBullets != "") {
		this.maxBullets = parseInt(settings.maxBullets);
	}
	if (settings.invincible !== undefined && settings.invincible != "") {
		this.invincible = parseInt(settings.invincible);
	}
	if (settings.dashing !== undefined && settings.dashing != "") {
		this.dashing = parseInt(settings.dashing);
	}
	if (settings.chatBoxOpen !== undefined && settings.chatBoxOpen != "") {
		this.chatBoxOpen = parseInt(settings.chatBoxOpen);
	}
	if (settings.color !== undefined && settings.color != "") {
		this.color = settings.color;
	}
	if (settings.isLeader !== undefined && settings.isLeader != "") {
		this.isLeader = parseInt(settings.isLeader);
	}
	if (settings.chatMessage !== undefined && settings.chatMessage != "") {
    const message = settings.chatMessage.replace(/~/g, ",");
    
    this.chatMessage = message;
		this.chatMessageTimer = 300;
    
    if(this.username.includes('Randomness')) return;
    
    const [ region, mode ] = RF.list[0].displayHostname.match(/(.+)-(.+)\.gats\.io/);
    const [ , clan = '', username ] = this.username.match(/(?:\[(.+)])? ?(.+)/);
    
    messages.push({ clan, username, message, timestamp: Date.now(), region, mode });
	}
};


setInterval(() => {
  let playerPos = c2.getRelPos(RD.pool[c3].getAttr());
  
  for (const bot of bots) {
    if(!bot.username) continue;
    
    let botPos = c2.getRelPos({
      x: bot.x,
      y: bot.y
    });
    
    j58.strokeStyle = bot.teamCode === RD.pool[c3].teamCode '#000';
    j58.strokeWeight = 2;
    j58.beginPath();
    j58.moveTo(botPos.x, botPos.y);
    j58.lineTo(playerPos.x, playerPos.y);
    j58.closePath();
    j58.stroke();
    }
});

/*let str = String(a41); a41 = eval('(' + str.slice(0, str.length - 1) + `setInterval(function() {
  let botPos = c2.getRelPos({
    x: 500,
    y: 500
  });
  
  let playerPos = c2.getRelPos(RD.pool[c3].getAttr());
  
  j58.strokeStyle = '#000';
  j58.strokeWeight = 2;
  j58.beginPath();
  j58.moveTo(botPos.x, botPos.y);
  j58.lineTo(playerPos.x, playerPos.y);
  j58.closePath();
  j58.stroke();
});` + '})()')*/
