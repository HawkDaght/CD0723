// This is the constructor for the game
CoryDash = function()
{
	// Make sure to call the constructor for the superclass
	CoryDash.superclass.constructor.call(this);
	
	var gameAssets = [
		{id: 'cory_startScreen', url: 'assets/images/screens/mainmenu/cory_startscreen.png'},
		{id: 'cory_falling', url: 'assets/images/screens/gameover/cory_falling.png'},
		{id: 'cory_endScreen_exhausted', url: 'assets/images/screens/gameover/cory_endScreen_exhausted.png'},
        {id : 'char',url : 'assets/images/cory_spriteSheet.png'},
        {id : 'platform',url : 'assets/images/ground_sprites.png'},
        {id : 'tree',url : 'assets/images/tree.png'},
        {id : 'enemy',url : 'assets/images/evilRobot_v2.png'},
        {id : 'explosion',url : 'assets/images/explosion_spritesheet.png'},
        {id : 'trail',url : 'assets/images/particle.png'},
		{id : 'jump_button',url : 'assets/images/jump_button.png'},
        {id : 'dash_button',url : 'assets/images/dash_button.png'},
        {id : 'energy_bar',url : 'assets/images/energyBar.png'},
        {id : 'energy_tile',url : 'assets/images/energyTile.png'},
		{id : 'energy_dmg',url : 'assets/images/energyDmg.png'},
		{id : 'danger_glow',url : 'assets/images/danger_glow.png'},
        {id : 'background_1',url : 'assets/images/background_trees.png'},
        {id : 'background_2',url : 'assets/images/background_hills.png'},
        {id : 'background_3',url : 'assets/images/background_mountains.png'},
		{id : 'tutorial_01',url : 'assets/images/tutorial01.png'},
		{id : 'tutorial_02',url : 'assets/images/tutorial02.png'},
	
		{id : 'cory_music',url: 'assets/audio/Game_Demo_Electronic.mp3', assetType:"audio"},
		{id : 'explosion_audio',url: 'assets/audio/explosion.wav', assetType:"audio"},
		{id : 'dash_audio',url: 'assets/audio/dash.wav', assetType:"audio"},
    ];



	// Tell the game about this list of assets - the "required" category is
	// for assets that need to be fully loaded before the game can start
	this.assetManager.assignImageAssetList("required", gameAssets);
	
    // Register the screens we will let TGE manage
    this.registerScreen("loading",this.createLoadingScreen);
    this.registerScreen("mainmenu",this.createMainMenu);
    this.registerScreen("gameover",this.createGameOverScreen);
}


// New methods and overrides for your game class will go in here
CoryDash.prototype =
{
    createLoadingScreen: function()
    {
        return new LoadingScreen(this.stage.width,this.stage.height);
    },

    createMainMenu: function()
    {
        return new MainMenu(this.stage.width,this.stage.height);
    },

    createGameOverScreen: function()
    {
        return new GameOver(this.stage.width,this.stage.height);
    },
	
	subclassSetupLayers: function(){
		this.CreateLayer("background");
		this.CreateLayer("platform");
		this.CreateLayer("tree");
		this.CreateLayer("absorb");
		this.CreateLayer("char");
		this.CreateLayer("enemy");
		this.CreateLayer("effect");
		this.CreateLayer("energy");
		this.CreateLayer("button");
		this.CreateLayer("score");
	},
		
    
	// TGE.Game method override - called when the gameplay starts
	subclassPlayGame : function()
	{
		this.dashKey = 88;
		this.jumpKey = 90;
		this.tutorial02 = this.getLayer("background").addChild(new TGE.Button().setup({
        x:this.stage.percentageOfWidth(0.5),
        y:this.stage.percentageOfHeight(0.5),
        image:"tutorial_02",
        pressFunction:this.StartPlaying.bind(this)
		}));
		
		this.tutorial01 = this.getLayer("background").addChild(new TGE.Button().setup({
        x:this.stage.percentageOfWidth(0.5),
        y:this.stage.percentageOfHeight(0.5),
        image:"tutorial_01",
        pressFunction:this.nextPage.bind(this)
		}));
	},
	
	subclassStartPlaying : function()
    {
		// Clear everything in the scene
		this.clearScene();
		// Game Entities
		this.myChar = null

		this.charXPos = 200;
		this.charScale =  0.35;

		// Game State

		//the distance the character have travelled.
		this.xDistance = 0;
		this.xSpeed = 18;
		this.ySpeed = 0;
		this.downGravity = 0.8;
		this.upGravity = 0.2;
		this.minUpSpeed = 5;
		this.upSpeed = 10;
		this.jump = 0;
		this.pressedJump = false;
		this.highestBoundary = 0.2;
		this.dashExtraSpeed = 20;
		this.dashFowardDistance = 128;
		this.dashTime = 20;
		this.dashCooldownTime = 80;
		this.dashtimer = 100;
		this.isDashing = false;
		this.dashingNow = 0;
		this.dashRefreshHight = 80;

		this.platformStartX = 0;
		
		this.absorbFrame = 1.4;

		this.dashKey = 88;
		this.jumpKey = 90;

		this.characterYratio = 0.4;

		this.shakeTimer = 0;
		this.shakeRange = 20;
		this.enemyExplosionShakingTime = 10;
		this.invincible = 0;
		this.hitenemy = false;

		this.shakeOffSet = {
			x: 0,
			y: 0,
		}
		
		this.energy = 100;
		this.energyMax = 100;

		this.hitByEnemy = false;

		this.exhausted = false;
		
		// Fill the background in with white
		this.setBackgroundColor("#000");
		
		this.myChar = this.getLayer("char").addChild(new TGE.SpriteSheetAnimation().setup({
			x:this.charXPos,
			y:this.stage.percentageOfHeight(0.3),
			scaleX: this.charScale,
			scaleY: this.charScale,
			image:"char",
		}));
		
		this.myChar.setImage("char",3,3);
		this.myChar.setSpriteIndex(6);
		this.dashSprite = 3;
		
		this.instantiatePlatform(0,0.5,3)
		this.instantiatePlatform(-2,0.7,2);
		this.instantiatePlatform(2,0.2,1);
		this.instantiatePlatform(3,0.4,3);
		this.instantiatePlatform(1,0.6,3);
		
		var a = Math.random() * 2;
		var b = Math.floor(Math.random() * 5)/10 + 0.2;
		var c = Math.floor(Math.random() * 6)+1;
		this.instantiatePlatform(a,b,c);
		
		var d = c* -1;
		var e = b - 0.3;
		var f = Math.floor(Math.random() * 6)+1;
		this.instantiatePlatform(d,e,f);
		this.beginning = 10;
	
		this.dangerGlow = this.getLayer("energy").addChild(new TGE.Sprite().setup({
			x:this.stage.percentageOfWidth(0.5),
            y:this.stage.percentageOfHeight(0.098),
			alpha:0,
			scaleX: 0.4,
			scaleY: 0.4,
			image:"danger_glow"
		}));
		
		this.myEnergy = this.getLayer("energy").addChild(new TGE.Sprite().setup({
			x:this.stage.percentageOfWidth(0.42),
            y:this.stage.percentageOfHeight(0.093),
			scaleX: 2,
			scaleY: 0.45,
			image:"energy_tile"
		}));
		
		this.myEnergyDmg = this.getLayer("energy").addChild(new TGE.Sprite().setup({
			x:this.stage.percentageOfWidth(0.42),
            y:this.stage.percentageOfHeight(0.093),
			scaleX: 0.2,
			scaleY: 0.45,
			image:"energy_dmg"
		}));
		this.myEnergyDmg.setImage("energy_dmg",1,2);
		this.myEnergyDmg.setSpriteIndex(1);
		
		this.myEnergyBar = this.getLayer("energy").addChild(new TGE.Sprite().setup({
			x:this.stage.percentageOfWidth(0.5),
            y:this.stage.percentageOfHeight(0.098),
			scaleX: 0.4,
			scaleY: 0.4,
			image:"energy_bar"
		}));
		
		this.myScoreText = this.getLayer("score").addChild(new TGE.Text().setup({
            x:this.stage.percentageOfWidth(0.9),
            y:this.stage.percentageOfHeight(0.08),
            text:"0",
            font:"bold 24px Arial",
            color:"#274"
        }));
		

		
		this.alive = true;
		this.distance = 0;
		this.enemykill = 0;
		this.myScore = 200;
		this.instantiateBackground("background_3",0.1);
		this.instantiateBackground("background_2",0.3);
		this.instantiateBackground("background_1",0.7);
		
		this.jumpButton = this.getLayer("button").addChild(new TGE.Button().setup({
			x:this.stage.percentageOfWidth(0.1),
			y:this.stage.percentageOfHeight(0.9),
			image:"jump_button"
		}));
		
		this.jumpButton.setImage("jump_button",1,2);
		this.jumpButton.setSpriteIndex(0);

		this.dashButton = this.getLayer("button").addChild(new TGE.Button().setup({
			x:this.stage.percentageOfWidth(0.9),
			y:this.stage.percentageOfHeight(0.9),
			image:"dash_button"
		}));
		
		this.dashButton.setImage("dash_button",1,2);
		this.dashButton.setSpriteIndex(0);
		
		this.audioManager.Play({id:"cory_music", loop:true});
	},
/*
	zoomEffect:function(object, originScaleX, originScaleY, xPos){
		object.scaleX = originScaleX * this.cameraScale;
		object.scaleY = originScaleY * this.cameraScale;
		object.x = (xPos - this.charXPos) * this.cameraScale + this.charXPos;
		//object.y = (yPos - this.stage.percentageOfHeight(0.5))* this.cameraScale + this.stage.percentageOfHeight(0.5);
	},
*/

	setShakeOffSet: function(){
		if(this.shakeTimer > 0){
			this.shakeTimer --;
			this.shakeOffSet.x = this.shakeRange*(Math.random()-0.5);
			this.shakeOffSet.y = this.shakeRange*(Math.random()-0.5);
		}
	},

	ObjectShake:function(object){
		if(this.shakeTimer > 0){
			//object.x += this.shakeOffSet.x;
			object.y += this.shakeOffSet.y;
		}	
	},

	// TGE.Game method override - called every update cycle with elapsed time since last cycle started
	subclassUpdateGame: function(elapsedTime)
    {	
		//stop the game if cory died.
		if(!this.alive){
			return;
		}
		
    	this.updateChar();

    	if(this.xDistance + this.stage.percentageOfWidth(1.5) > this.platformStartX){
    		a = Math.random() * 2;
			b = Math.floor(Math.random() * 5)/10 + 0.3;
			c = Math.floor(Math.random() * 6)+1;
			this.instantiatePlatform(a,b,c);
			
			d = c* -1;
			e = b - 0.8 + Math.floor(Math.random() * 5)/10;
			f = Math.floor(Math.random() * 6)+1;
			this.instantiatePlatform(d,e,f);
    	}
		
		if (this.beginning <=0){
			if(this.hitenemy && this.myEnergy.scaleX <= 0.1){
				this.myEnergy.scaleX -= 0;
			}else{
				this.myEnergy.scaleX -= 0.003;
			}
		this.myEnergyDmg.x = this.myEnergy.x + this.myEnergy.width * this.myEnergy.scaleX/2;
		}
		
		if(this.myEnergy.scaleX < 0.5){
			this.dangerGlow.alpha = Math.sin(this.xDistance/80)*0.8+0.2;
		}else{
			this.dangerGlow.alpha = 0;
		}
		
		if(this.invincible > 0 ){
			this.myEnergyDmg.scaleX = 0.2;
			if(this.myEnergy.scaleX <= 0.2){
				this.myEnergyDmg.x = this.stage.percentageOfWidth(0.42);
			}
		}else{
		this.myEnergyDmg.scaleX = 0.003;
		}
		
		if(this.myEnergy.scaleX <= 0 && !this.exhausted){
			this.myEnergy.scaleX = 0;
			this.exhausted = true;
		}

		if(this.exhausted){
			this.xSpeed -= this.xSpeed * 0.008;
			this.downGravity = 0.1;
			this.myEnergy.scaleX = 0;
		}


		if(this.myChar.y > this.stage.percentageOfWidth(1)){
			this.EndGame();
		}

	    this.setShakeOffSet();
		this.distance = Math.round(this.xDistance/10);
		this.myScore = Math.floor(this.distance * 0.5 + this.enemykill);
		this.myScoreText.text = this.myScore.toString();
	},
	
	subclassEndGame: function()
    {
		this.alive = false;
		this.audioManager.StopAll();
	},
	
	updateChar:function(elapsedTime){
		
	//set sprite index
		var s =3;		
		
	//check if is on the ground & not dashing
		if (this.ySpeed == 0 && this.jump == 0 && !this.isDashing){
		s= 3;
		this.myChar.rotation += 25;
		}else{
		this.myChar.rotation = Math.atan(this.ySpeed/this.xSpeed)*180/Math.PI;
		s = 6;
		}
		
    	if(!this.pressedJump){
    		this.ySpeed += this.downGravity;
    	}
    	else{
    		this.ySpeed += this.upGravity;
    	}
		
	//touch control
		if(this.isMobileDevice){
			if(this.isMouseDown()){
				if(this.mMouseX < this.stage.width/2){
					this.touchJump =true;
				}
				else if(this.mMouseX >= this.stage.width/2){
					this.touchDash =true;
				}
			}
			else{
				this.touchJump = false;
				this.touchDash = false;
			}
		}


		//stop beginning dash
		if (this.isKeyDown(this.jumpKey) || this.touchJump||this.isKeyDown(this.dashKey) || this.touchDash) {
			if(this.beginning != 0){
				this.beginning = 0;
				this.dashTimer = 20;
			}
		}

    //jump
    	//jumping control
		if (!this.exhausted && ((this.isKeyDown(this.jumpKey) && !this.isMobileDevice) || (this.touchJump) && this.isMobileDevice)) {
			this.doJump = true;
		}else{
			this.doJump =false;
		}
		
		//button UI
		if(this.doJump){
			this.jumpButton.setSpriteIndex(1);
		}else{
			this.jumpButton.setSpriteIndex(0);
		}
		
    	if(this.doJump && !this.pressedJump && this.dashtimer >= this.dashTime){
    		this.pressedJump = true;
    		if(this.jump < 2){
    			this.jump ++;
    			this.ySpeed = - this.upSpeed;
    		}
    	}
    	else if(this.pressedJump && !this.doJump){
    		this.pressedJump = false;
			if(this.ySpeed < -this.minUpSpeed){
				this.ySpeed = -this.minUpSpeed;
			}    		
    	}
    //Trail effect normal
    if(!this.exhausted){
    	var p = Math.random();
    	if(p<0.3){
    		this.instantiateTrail(1);
    	}
    }
    //begining dash time
    	this.beginning -= 0.08;


    //dash		
		if (!this.exhausted && ((this.isKeyDown(this.dashKey) && !this.isMobileDevice)|| (this.touchDash && this.isMobileDevice)|| this.beginning >0)) {
			this.doDash = true;
		}else{
			this.doDash =false;
		}
		
		if(this.doDash && this.beginning <=0){
			this.dashButton.setSpriteIndex(1);
		}
		else{
			this.dashButton.setSpriteIndex(0);
		}
		
		
    	if(this.doDash && this.dashtimer >= this.dashCooldownTime + this.dashTime || this.beginning >0){
			this.dashingNow = 50;
    		this.dashtimer = 0;
    		this.isDashing = true;
    		this.myChar.x = this.charXPos + this.dashFowardDistance;
			this.audioManager.Play({id:"dash_audio", loop:false});
    		this.pressedJump =false;
    		if(this.jump >1){
    			this.jump =1;
    		}

    		this.instantiateTrail(50);

    	}

    	
    	if(this.dashtimer < this.dashTime){
    		this.myChar.x -= this.dashFowardDistance/this.dashTime;
    		this.instantiateTrail(5);
    		this.ySpeed = 0;
			
			if(this.dashSprite < 5){
				this.dashSprite += 0.5;
			}
			
    	}
    	else if(this.dashtimer == this.dashTime){
    		this.myChar.x = this.charXPos;
    		this.isDashing = false;
			if(this.dashSprite>3){
				this.dashSprite -= 1;
			}
			
    	}
		if(this.isDashing){
			this.myChar.setSpriteIndex(Math.floor(this.dashSprite));
		}else{
			this.myChar.setSpriteIndex(s);
		}
		
		if(this.beginning <= 0){
    		this.dashtimer += 1;
		}
		if(this.dashingNow != 0){
			this.dashingNow -= 1;
		}
		
	//Set invincible timer	
		if(this.invincible>0){
		this.invincible -= 0.1;
		}else{
		this.invincible = 0;
		}

    //upper boudary
    	if(this.myChar.y < this.stage.percentageOfHeight(this.highestBoundary) && this.ySpeed < -this.minUpSpeed){
    		this.ySpeed = - this.minUpSpeed;
    	}
    	
    	this.xDistance += this.xSpeed;
    	this.myChar.y += this.ySpeed * this.characterYratio;

    //shaking
    	this.ObjectShake(this.myChar);
		
	},
	
	
	instantiateBackground:function(image,dampen){

		this.setbackgroundSprite(image,dampen,1);
		this.setbackgroundSprite(image,dampen,2);

	},

	setbackgroundSprite:function(image,dampen,index){

		var background = new TGE.Sprite().setup({
			image:image,
			//x:this.stage.percentageOfWidth(0.5),
			//y:this.stage.percentageOfHeight(0.5),
		})
		background.y = this.stage.percentageOfHeight(0.5) + (this.stage.percentageOfHeight(0.5)-this.myChar.y) * (1-this.characterYratio) * dampen;

		var scale = this.stage.percentageOfHeight(1)*(1 + ((1 - this.characterYratio) * dampen)/this.characterYratio)/background.height;
		background.scaleX = background.scaleY = scale;

		

		if(index == 1){
			background.x = 0;
		}
		else if(index ==2)
		{
			background.x = background.width * background.scaleX;
		}

		this.getLayer("background").addChild(background);
		background.dampen = dampen;
		background.addEventListener("update",this.updateBackground.bind(this));

	},

	updateBackground:function(event){
		var background = event.currentTarget;
		background.x -= this.xSpeed * background.dampen;
		background.y = this.stage.percentageOfHeight(0.5) + (this.stage.percentageOfHeight(0.5)-this.myChar.y) * (1-this.characterYratio) * background.dampen;
		//background.y -= this.ySpeed * (1-this.characterYratio) * background.dampen;
		if(background.x < -background.width*background.scaleX/2){
			background.x += 2 * background.width*background.scaleX;
		}
		this.ObjectShake(background);

	},

	instantiateTrail:function(n){
    		var i;
    		for(i=0;i<n;i++){
    			var trail = new TGE.Sprite().setup({
    				x: this.myChar.x - this.myChar.width * this.myChar.scaleX/2,
    				y: this.myChar.y + (Math.random()-0.5)*this.myChar.height * this.myChar.scaleY * 0.5,
    				scaleX:0.2,
    				scaleY:0.2,
    				image:"trail",
    			})
    			if(this.isDashing){
    				trail.x = Math.random()*this.myChar.x;
    				trail.y = this.myChar.y + (Math.random() -0.5)* this.myChar.height * this.myChar.scaleY;
    			}

    			trail.xPos = trail.x + this.xDistance;
    			trail.ySpeed = (Math.random()-0.5)*1;
    			this.getLayer("effect").addChild(trail);
    			trail.addEventListener("update",this.updateTrail.bind(this));
    		}
	},

	updateTrail:function(event){
		trail = event.currentTarget;
		this.backgroundObjectMoving(trail,trail.xPos);
		trail.y += trail.ySpeed;
	},


	
	
	instantiateAbsorb:function(n){
		var i;
		for(i=0; i<n; i++){
    			absorb = new TGE.Sprite().setup({
    				x: this.myChar.x + Math.sin(i*0.4)*10 - this.dashFowardDistance,
    				y: this.myChar.y + Math.cos(i*0.4)*10,
    				scaleX:1,
    				scaleY:1,
    				image:"trail",
					rotation: i,
    			})
    		this.getLayer("absorb").addChild(absorb);
			absorb.Frame = 1.4;
			drag = 1;
    		absorb.addEventListener("update",this.updateAbsorb.bind(this));
		}
	},
	
	updateAbsorb:function(event){
	absorb = event.currentTarget;
		absorb.Frame +=0.06;
		
		if(absorb.scaleX > 0.7){
			absorb.scaleDecay = Math.round(Math.random()*15)*0.0006+0.004;
			absorb.scaleX -= absorb.scaleDecay;
			absorb.scaleY -= absorb.scaleDecay;
			absorb.xSpeed = 15*Math.sin(absorb.rotation*0.4)*Math.sin(absorb.Frame) - this.xSpeed;
			absorb.ySpeed = 15*Math.cos(absorb.rotation*0.4)*Math.sin(absorb.Frame) + (1-this.characterYratio)*this.ySpeed;
			absorb.x += absorb.xSpeed;
			absorb.y += absorb.ySpeed;
		}else{
			if(absorb.x>this.myChar.x){
				absorb.markForRemoval();
				this.invincible = 0;
				this.hitenemy = false;
				if(this.myEnergy.scaleX <= 1.8){
					this.myEnergy.scaleX += 0.013;
				}else{
					this.myEnergy.scaleX = 2;
				}
			}
				absorb.scaleDecay = 0.002;
				absorb.scaleX -= absorb.scaleDecay;
				absorb.scaleY -= absorb.scaleDecay;
				absorb.rotation *= 1.1;
				absorb.x = (absorb.x-this.myChar.x)*(0.8 - absorb.rotation * 0.05)+this.myChar.x;
				absorb.y = (absorb.y-this.myChar.y)*(0.8 - absorb.rotation * 0.05)+this.myChar.y;
		}
		if(absorb.Frame >= 4.7){
			absorb.Frame = 1.4;
		}
		
	},
	
	instantiatePlatform:function(gap,height,length){		
		var i = 0;
		var imageWidth = 128;
		var newPlatform = new Array();

		this.platformStartX += gap * imageWidth;
		for(i=0;i<length + 2;i++){
			newPlatform[i] = new TGE.Sprite().setup({
				y:this.stage.percentageOfHeight(1 - height),
				x: this.platformStartX + i*imageWidth,
				scaleX:0.5,
				scaleY:0.5,
				image:"platform",
			})

			newPlatform[i].setImage("platform",1,3);
			if(i==0){
				newPlatform[i].setSpriteIndex(0);
			}
			else if(i == length + 1){
				newPlatform[i].setSpriteIndex(2);
			}
			else{
				newPlatform[i].setSpriteIndex(1);
			}

			//newPlatform[i].setSpriteIndex(0);
			newPlatform[i].xPos = newPlatform[i].x;
//			newPlatform[i].yPos = newPlatform[i].y;
			
			this.getLayer("platform").addChild(newPlatform[i]);
			newPlatform[i].addEventListener("update",this.updatePlatform.bind(this));


			//trees
			var p = Math.random();
			if(p<0.3){
				var tree = new TGE.Sprite().setup({
					x:newPlatform[i].x,
					y:newPlatform[i].y,//+	newPlatform[i].height,
					image:"tree",
				})
				tree.scaleY = tree.scaleX = Math.random()*0.8 + 0.2;
				tree.y -= tree.height*0.5*tree.scaleX;


				tree.setImage("tree",1,3);
				tree.setSpriteIndex(Math.floor(Math.random()*3));
				tree.xPos = tree.x;
				this.getLayer("tree").addChild(tree);
				tree.addEventListener("update",this.updateTree.bind(this));
			}

			//enemies
			p = Math.random();
			if(p<0.2){
				var enemy = new TGE.Sprite().setup({
					x:newPlatform[i].x + Math.random()*30-15,
					y:newPlatform[i].y,//+	newPlatform[i].height,
					image:"enemy",
				})
				enemy.scaleY = enemy.scaleX = 0.4;
				enemy.y -= enemy.height*0.5*enemy.scaleX;


				enemy.setImage("enemy",1,1);
				enemy.setSpriteIndex(0);
				enemy.xPos = enemy.x;
				this.getLayer("enemy").addChild(enemy);
				enemy.addEventListener("update",this.updateEnemy.bind(this));
			}
		}
		this.platformStartX += (length + 2) * imageWidth;
	},
	
	
	updatePlatform:function(event){
		var platformSection = event.currentTarget;
		//Check if cory hits the ground
		if(this.myChar.x <= platformSection.x + platformSection.width/2 && this.myChar.x >= platformSection.x-platformSection.width/2){
			var platformPlane = platformSection.y - platformSection.height*0.1;
			
			//landing on the ground
			if(this.ySpeed > 0 && !this.exhausted){
				
				if(this.myChar.y >= platformPlane && this.myChar.y < platformPlane + this.ySpeed){
					this.ySpeed = 0;
					this.myChar.y = platformPlane;
					this.jump = 0;
				}
			}			
			
			//refresh dash on the ground
			if(this.myChar.y >= platformPlane && this.myChar.y < platformPlane + this.dashRefreshHight){
				if(this.dashtimer > this.dashTime && this.dashtimer < this.dashTime + this.dashCooldownTime){
						this.dashtimer = this.dashTime + this.dashCooldownTime;
				}
			}
		}
		this.backgroundObjectMoving(platformSection,platformSection.xPos);
	},

	updateTree:function(event){
		var tree = event.currentTarget;
		this.backgroundObjectMoving(tree,tree.xPos);
	},

	updateEnemy:function(event){
		var enemy = event.currentTarget;
		this.charTall = this.myChar.height *this.myChar.scaleY/2;
		this.charWide = this.myChar.width * this.myChar.scaleX/2;
		
		this.enemyTall = enemy.height*enemy.scaleY/2;
		this.enemyWide = enemy.width*enemy.scaleX/2;
		this.collideX = this.charWide + this.enemyWide;
		this.collideY =  this.charTall + this.enemyTall;
		
		if(this.isDashing){
			if(Math.abs(enemy.y - this.myChar.y) < this.collideY && enemy.x < this.myChar.x + this.dashFowardDistance + this.collideX){
				
				var explosion = new TGE.Sprite().setup({
					x:enemy.x,
					y:enemy.y,
					image:"explosion",
					scaleX: 1.5,
					scaleY: 1.5,
				})

				explosion.setImage("explosion",1,4);
				explosion.index = 0;
				explosion.setSpriteIndex(explosion.index);
				explosion.xPos = enemy.xPos;
				this.getLayer("effect").addChild(explosion);
				explosion.addEventListener("update",this.updateExplosion.bind(this));
				this.shakeTimer = this.enemyExplosionShakingTime;
								
				enemy.markForRemoval();
				
				var kill = new TGE.Text().setup({
					x: this.myChar.x-this.myChar.width,
					y: this.myChar.y,
					text:"+100",
					hAlign:"center",
					font:"bold 24px Arial",
					color:"#274",
				});
				this.getLayer("score").addChild(kill);
				kill.addEventListener("update",this.updateKill.bind(this));
				this.instantiateAbsorb(15);
				this.hitenemy = true;
				this.audioManager.Play({id:"explosion_audio", loop:false});
			}
		}
		/*if(!this.isDashing){
			if(Math.abs(enemy.y - this.myChar.y) < this.collideY && enemy.x < this.myChar.x + this.dashFowardDistance + this.collideX && this.invincible == 0 && this.dashingNow ==0)
			{
			this.invincible = 5;
			this.myEnergy.scaleX -= 0.2;
			}
		}*/
		this.backgroundObjectMoving(enemy,enemy.xPos);
				
	},
	
	updateKill:function(event){
		var kill = event.currentTarget;
		if (kill.y > this.stage.percentageOfHeight(0.2)){
		kill.y -=this.stage.percentageOfHeight(0.01);
		}
		
		if (kill.x < this.stage.percentageOfWidth(0.9)){
		kill.x += 25;
		}
		
		kill.alpha -= 0.02;
		if (kill.alpha < 0.1){
		kill.markForRemoval();
		this.enemykill += 100;
		}

	},
	
	updateExplosion:function(event){
		var explosion = event.currentTarget;
		if(explosion.index < 4){
			explosion.setSpriteIndex(Math.floor(explosion.index));
			explosion.index += 0.25	;
		}
		if(explosion.index >= 4)
		{
			explosion.markForRemoval();
		}
		this.backgroundObjectMoving(explosion,explosion.xPos);
		
	},

	backgroundObjectMoving:function(object,xPos){
		object.y -= (1-this.characterYratio)*this.ySpeed;
		object.x = xPos - this.xDistance;
		if(object.x  < - object.width){
			object.markForRemoval();
		}
		//this.zoomEffect(object,1,1,object.x);
		this.ObjectShake(object);
	},
	
	getScore: function()
    {
		return this.myScore;
	},

	getExhausted:function(){
		return this.exhausted;
	},
	nextPage:function(a){
		a.markForRemoval();
	},

}
extend(CoryDash,TGE.Game);