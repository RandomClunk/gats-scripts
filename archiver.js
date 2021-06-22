const walls = [];

RB.prototype.activate = function(data) {
	this.parent = data.parentId;
  
	this.type = data.type;
  
	this.x = data.x / 10;
	this.y = data.y / 10;
  
	this.angle = data.angle;
  
	this.maxHp = data.maxHp;
	this.hp = data.hp;
  
	this.isPremium = data.isPremium;
	this.model = a11(this.type, this.isPremium);
  
  switch (this.type) {
    case 'crate': {
      this.width = 50;
      this.height = 50;
      
      this.bulletCollisions = true;
      
      if(!walls.find(wall => wall.id === data.id)) walls.push({
        id: data.id,
        type: this.type,
        x: this.x,
        y: this.y,
        width: 100,
        height: 100
      });
      
      break;
    }
    
    case 'longCrate': {
      this.width = 50;
			this.height = 100;
      
      this.bulletCollisions = true;
      
      if(!walls.find(wall => wall.id === data.id)) walls.push({
        id: data.id,
        type: this.type,
        x: this.x,
        y: this.y,
        width: this.angle === '90' ? 100 : 50,
        height: this.angle === '180' ? 100 : 50
      });
      
      break;
    }
    
    case 'medkit': {
      this.width = 33;
			this.height = 33;
      
			this.bulletCollisions = false;
      
      break;
    }
    
    case 'shield': {
      this.width = 33;
			this.height = 33;
      
			this.bulletCollisions = true;
      
      break;
    }
  }
  
	this.activated = 1;
}
