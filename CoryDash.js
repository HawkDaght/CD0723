// This is the constructor for the game
CoryDash = function()
{
	// Make sure to call the constructor for the superclass
	CoryDash.superclass.constructor.call(this);
	
	var gameAssets = [
		{id: 'cory_startScreen', url: 'assets/images/screens/mainmenu/intro_screen.png'},
		{id: 'cory_endScreen', url: 'assets/images/screens/gameover/cory_falling.png'},
		{id: 'cory_endScreen_exhausted', url: 'assets/images/screens/gameover/cory_tired.png'},
        {id : 'char',url : 'assets/images/cory_sprites.png'},
        {id : 'platform',url : 'assets/images/ground_sprites.png'},
        {id : 'tree',url : 'assets/images/tree.png'},
        {id : 'enemy',url : 'assets/images/robot_spritesheet.png'},
        {id : 'explosion',url : 'assets/images/explosion_spritesheet.png'},
        {id : 'trail',url : 'assets/images/particle.png'},
        {id : 'transmit',url : 'assets/images/energy_waves.png'},
        {id : 'laser',url : 'assets/images/laser.png'},
		{id : 'jump_button',url : 'assets/images/jump_button.png'},
        {id : 'dash_button',url : 'assets/images/dash_button.png'},
        {id : 'energy_bar',url : 'assets/images/energyBar.png'},
        {id : 'energy_tile',url : 'assets/images/energyTile.png'},
        {id : 'boss_energy_bar',url : 'assets/images/robot_energybar.png'},
        {id : 'boss_energy_tile',url : 'assets/images/robot_energy.png'},
		{id : 'energy_dmg',url : 'assets/images/energyDmg.png'},
		{id : 'danger_glow',url : 'assets/images/danger_glow.png'},
		{id : 'boss',url : 'assets/images/mosquito_robot.png'},
        {id : 'background_1',url : 'assets/images/background_trees.png'},
        {id : 'background_2',url : 'assets/images/background_hills.png'},
        {id : 'background_3',url : 'assets/images/background_mountains.png'},
		{id : 'tutorial_01',url : 'assets/images/tutorial01.png'},
		{id : 'tutorial_02',url : 'assets/images/tutorial02.png'},
		{id : 'cory_music',url: 'assets/audio/Game_Demo_Electronic.mp3', assetType:"audio"},
		{id : 'explosion_audio',url: 'assets/audio/explosion.wav', assetType:"audio"},
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
		this.CreateLayer("boss");
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
		this.charXPos = 200; // the character's origin xPos. When dash the char will move forward a little and back to this pos after dash
		this.charScale =  0.35;


		// Game State

		//the distance the character have travelled.
		this.xDistance = 0;//the progress of the game


		this.xSpeed_Normal = 18;//the normal speed of the game.
		this.xSpeed_Rush = 25;//when rushTimer > 0, the game speed becomes higher
		this.rushTimer = 0;//when rushTimer > 0, rush.

		this.xSpeed = this.xSpeed_Normal;//the actual x speed of the game. change this will change to scrolling speed
		this.ySpeed = 0;//the relative speed between char and background.
		this.characterYratio = 0.4;// ySpeed * characterYratio = the speed of character in screen; the background moves in an opposite direction in ySpeed * (1-characterYratio)

		this.upGravity = 0.4;//the gravity when player jump and hold down the button
		this.downGravityNormal = 1.4;// the gravity when player releases jump button
		this.downGravityExhausted = 0.1;//falling gravity when running out of energy
		this.downGravity = this.downGravityNormal;//actual gravity

		this.minUpSpeed = 5;//when player releases the jump button, upspeed will not exceed this value
		this.upSpeed = 15;//when the char jumps, the speed will be change to this immediately
		this.jump = 0;//how many times the player has jumped continuely. (for double jump function)
		this.pressedJump = false;//if the player presses jump and holds down
		this.highestBoundary = 0.2;//the upper boundary that the char will not exceed
		
		this.dashFowardDistance = 128;//the sprite will move forward when dashing and returns to the original xPos later
		this.dashTime = 20;//The frame numbers of a dash
		this.dashCooldownTime = 80;//the time needed to cooldown a dash when the char is in the air (dash will refresh when the char is grounded)
		this.dashtimer = this.dashTime + this.dashCooldownTime;
		this.isDashing = false;
		this.dashingNow = 0;
		this.dashRefreshHight = 80;//the vertical distance to the platform required for refreshing dash without waiting for cooldown
		
		this.platformStartX = 0;//record the position of the last generated platform piece
		
		this.absorbFrame = 1.4;

		this.level = 1;//the difficulty level of the level.

		//KeyCodes for PC
		this.dashKey = 88;
		this.jumpKey = 90;

		
		//camera shaking effect
		this.shakeTimer = 0;//when shakeTimer > 0, it shakes!
		this.shakeRange = 20;
		this.enemyExplosionShakingTime = 10;
		this.invincible = 0;
		this.hitenemy = false;
		this.revive = 0;
		this.shakeOffSet = {
			x: 0,
			y: 0,
		}
		
		this.hitByEnemy = false;

		this.exhausted = false;//see if the player dies because of lack of energy
		
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
		

		//instantiate the first platforms within the starting screen
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


		

		/*
    	this.levelText = this.getLayer("score").addChild(new TGE.Text().setup({
            x:this.stage.percentageOfWidth(0.2),
            y:this.stage.percentageOfHeight(0.08),
            text:this.level,
            font:"bold 24px Arial",
            color:"#274"
        }));
		*/

		this.dangerGlow = this.getLayer("energy").addChild(new TGE.Sprite().setup({
			x:this.stage.percentageOfWidth(0.5),
            y:this.stage.percentageOfHeight(0.098),
			alpha:0,
			scaleX: 0.4,
			scaleY: 0.4,
			image:"danger_glow",
		}));

		this.dangerText = this.getLayer("energy").addChild(new TGE.Text().setup({
			x:this.stage.percentageOfWidth(0.5),
			y:this.stage.percentageOfHeight(0.22),
			text:"Destroy Robots for Energy!",
			font:"bold 36px Arial",
			color:"#ff0000",
			alpha:0,
		}));

		this.boss = this.getLayer("boss").addChild(new TGE.Button().setup({
			x:this.stage.percentageOfWidth(0.7),
			y:this.stage.percentageOfHeight(0.5),
			image:"boss",
			scaleX: 1.8,
			scaleY: 1.8,
		}));
		this.boss.isAlive = true;

		this.bossEnergy = this.getLayer("energy").addChild(new TGE.Sprite().setup({
			x:this.stage.percentageOfWidth(0.5),
            y:this.stage.percentageOfHeight(0.9),
			scaleX: 5,
			scaleY: 0.62,
			image:"boss_energy_tile"
		}));
		this.bossEnergy.max = 4.85;

		this.bossEnergyBar = this.getLayer("energy").addChild(new TGE.Sprite().setup({
			x:this.stage.percentageOfWidth(0.5),
            y:this.stage.percentageOfHeight(0.9),
			scaleX: 1,
			scaleY: 1,
			image:"boss_energy_bar"
		}));

		this.bossEnergy.x = this.bossEnergyBar.x - this.bossEnergyBar.width * this.bossEnergyBar.scaleX*0.38;	
	},

/*
	zoomEffect:function(object, originScaleX, originScaleY, xPos){
		object.scaleX = originScaleX * this.cameraScale;
		object.scaleY = originScaleY * this.cameraScale;
		object.x = (xPos - this.charXPos) * this.cameraScale + this.charXPos;
		//object.y = (yPos - this.stage.percentageOfHeight(0.5))* this.cameraScale + this.stage.percentageOfHeight(0.5);
	},
*/
	// TGE.Game method override - called every update cycle with elapsed time since last cycle started
	subclassUpdateGame: function(elapsedTime)
    {	
    	this.updateBoss();
    	this.rush();
		if (this.reviveTimer > 0 ){
			this.updateRevive();
		}
    	//this.levelText.text = this.level;
		//stop the game if cory died.
	    if(this.alive){
    		this.updateChar();
    		this.levelGenerator();
		
			if (this.beginning <=0){
				if(this.hitenemy && this.myEnergy.scaleX <= 0.1){
					this.myEnergy.scaleX -= 0;
				}else{
					this.myEnergy.scaleX -= (0.002 + this.myEnergy.scaleX * 0.001);
				}
			this.myEnergyDmg.x = this.myEnergy.x + this.myEnergy.width * this.myEnergy.scaleX/2;
			}
		
			if(this.invincible > 0 ){
				this.myEnergyDmg.scaleX = 0.2;
				if(this.myEnergy.scaleX <= 0.2){
					this.myEnergyDmg.x = this.stage.percentageOfWidth(0.42);
				}
			}
			else{
				this.myEnergyDmg.scaleX = 0.003;
			}
		
			if(this.myEnergy.scaleX <= 0 && !this.exhausted){
				this.myEnergy.scaleX = 0;
				this.exhausted = true;
			}

			//the cenematic of cory dies for energy exhausted
			if(this.exhausted){
				this.xSpeed -= this.xSpeed * 0.008;
				this.downGravity = this.downGravityExhausted;
				this.myEnergy.scaleX = 0;
			}


			if(this.myChar.y > this.stage.percentageOfHeight(1) + this.myChar.height * this.myChar.scaleY/2){
				this.alive = false;
				this.contPlay();
			}

	   		this.setShakeOffSet();

			this.myScore = Math.floor(this.xDistance * 0.05 + this.enemykill);
			this.myScoreText.text = this.myScore.toString();
		}
		else if(!this.alive && this.revive <=0){
			this.xSpeed -= this.xSpeed * 0.02;
		}
		this.updateGlow();
	},


	updateBoss:function(){
		if(this.bossEnergy.scaleX < this.bossEnergy.max){
			this.bossEnergy.scaleX += 0.001;
		}
		else{
			this.bossEnergy.scaleX = this.bossEnergy.max;
		}
		if(this.bossEnergy.scaleX <= 0 && this.boss.isAlive){
			this.bossEnergy.markForRemoval();
			this.boss.isAlive = false;
			this.boss.xPos = this.boss.x + this.xDistance;
		}
		if(!this.boss.isAlive){
			if(this.boss.x + this.boss.width * this.boss.scaleX < 0){
				this.boss.markForRemoval();
			}
			else{
				this.instantiateExplosion(this.boss.x + (Math.random()-0.5) *this.boss.width,this.boss.y + (Math.random()-0.5)*this.boss.height,Math.random()*0.5+0.2,10);
				this.boss.x -= 3;
				this.boss.y += 1;
			}
		}
		else{
			this.boss.y = (Math.sin(this.xDistance/300) - 0.5)* this.stage.percentageOfHeight(0.25) + this.stage.percentageOfHeight(0.5);
			this.boss.x = (Math.sin(this.xDistance/1000)- 0.5) + 0.5*(Math.sin(this.xDistance/1000)*(Math.sin(this.xDistance/1000))- 0.5) * this.stage.percentageOfWidth(0.5) + this.stage.percentageOfWidth(0.7);
		}
		//this.boss.y -= this.ySpeed * (1-this.characterYratio);
	},

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

	rush:function(){
		if(this.rushTimer > 0){
			this.rushTimer --;
			this.xSpeed = this.xSpeed_Rush;
			this.jump = 0;
		}
		else{
			if(this.xSpeed > this.xSpeed_Normal){
				this.xSpeed -= (this.xSpeed - this.xSpeed_Normal)*0.05;
			}
		}
	},

	updateGlow:function() {
		if(this.myEnergy.scaleX < 0.5){
			this.dangerGlow.alpha = Math.sin(this.xDistance/200)* 0.5 + 0.5;
		}else{
			this.dangerGlow.alpha = 0;
		}
		this.dangerText.alpha = this.dangerGlow.alpha;
	},

	levelUp:function(currentlevel){
		var levelLength = 50;
		if(this.level == i && this.xDistance > this.stage.percentageOfWidth(levelLength) * i && this.xDistance < this.stage.percentageOfWidth(levelLength) * (i+1)){
			this.level ++;
			this.shakeTimer = 300;
			this.rushTimer = 250;
		}
	},

	levelGenerator:function(){
		this.levelUp(1);
		this.levelUp(2);
		this.levelUp(3);
		this.levelUp(4);

		if(this.xDistance + this.stage.percentageOfWidth(1.5) > this.platformStartX){
			if(this.level == 1){
				var a = Math.random() * 2;
				var b = Math.floor(Math.random() * 5)/10 + 0.3;
				var c = Math.floor(Math.random() * 8)+3;			
				var d = c* (-1 + 0.3*Math.random());
				var e = b - 0.8 + Math.floor(Math.random() * 5)/10;
				var f = Math.floor(Math.random() * 8)+3;
				this.level = 1;
			}
			else if(this.level == 2){
				var a = Math.random() * 3;
				var b = Math.floor(Math.random() * 5)/10 + 0.3;
				var c = Math.floor(Math.random() * 8)+2;			
				var d = c* (-1 + 0.6*Math.random());
				var e = b - 0.8 + Math.floor(Math.random() * 5)/10;
				var f = Math.floor(Math.random() * 8)+2;
				this.level = 2;

			}
			else if(this.level == 3){
				var a = Math.random() * 4;
				var b = Math.floor(Math.random() * 5)/10 + 0.3;
				var c = Math.floor(Math.random() * 7)+2;			
				var d = c* (-1 + Math.random());
				var e = b - 0.8 + Math.floor(Math.random() * 5)/10;
				var f = Math.floor(Math.random() * 7)+2;
				this.level = 3;
			}
			else if(this.level == 4){
				var a = Math.random() * 4.5;
				var b = Math.floor(Math.random() * 5)/10 + 0.3;
				var c = Math.floor(Math.random() * 6)+1;			
				var d = c* (-1 + 2*Math.random());
				var e = b - 0.8 + Math.floor(Math.random() * 5)/10;
				var f = Math.floor(Math.random() * 6)+1;
				this.level = 4;
			}
			else{
				var a = Math.random() * 4.5;
				var b = Math.floor(Math.random() * 5)/10 + 0.3;
				var c = Math.floor(Math.random() * 5)+1;			
				var d = 5*(Math.random() - 0.3);
				var e = b - 0.8 + Math.floor(Math.random() * 5)/10;
				var f = Math.floor(Math.random() * 5);
				this.level = 5;
			}
			this.instantiatePlatform(a,b,c);
			this.instantiatePlatform(d,e,f);
    	}
	},
	
	subclassEndGame: function()
    {
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
    	
		

		if(this.isDashing){
			this.ySpeed = 0;
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

	instantiateTransmit:function(xPos,yPos,randomRange,n){
		var i;
    	for(i=0;i<n;i++){
    		var transmit = new TGE.Sprite().setup({
    			x: xPos + (Math.random()-0.5) * randomRange,
    			y: yPos + (Math.random()-0.5) * randomRange,
    			scaleX:0.2,
    			scaleY:0.2,
    			image:"transmit",
    		})
    		this.getLayer("effect").addChild(transmit);
    		transmit.addEventListener("update",this.updateTransmit.bind(this));
   		}		
	},
	updateTransmit:function (event) {
		var transmit = event.currentTarget;
		var lerpSpeed = 0.05;
		var speed = 5;
		
		transmit.x += lerpSpeed*(this.boss.x - transmit.x);
		transmit.y -= this.ySpeed*(1-this.characterYratio);
		transmit.y += lerpSpeed*(this.boss.y - transmit.y);
		transmit.rotation = Math.atan((this.boss.y-transmit.y)/(this.boss.x - transmit.x)) * 180/Math.PI;
		transmit.scaleX = transmit.scaleY = Math.abs(transmit.x - this.boss.x) * 0.0005;
		transmit.alpha -= 0.01;

		if(Math.abs(transmit.x - this.boss.x) < 5){
			transmit.markForRemoval();
		}
	},

	instantiateLaser:function(enemy){
		var laser = new TGE.Sprite().setup({
    			x: enemy.x,
    			y: enemy.y,
    			scaleX:1,
    			scaleY:1,
    			image:"laser",
    		})
		this.getLayer("background").addChild(laser);
		laser.enemy = enemy;
		laser.timer = 30;
    	laser.addEventListener("update",this.updateLaser.bind(this));
	},

	updateLaser:function (event){
		var laser = event.currentTarget;
		var xDif = this.boss.x - laser.enemy.x;
		var yDif = this.boss.y - laser.enemy.y;

		laser.x = 0.5*(laser.enemy.x + this.boss.x);
		laser.y = 0.5*(laser.enemy.y + this.boss.y);
		laser.scaleX = Math.sqrt(xDif*xDif+yDif*yDif)/laser.width;
		laser.rotation = Math.atan(yDif/xDif) * 180/Math.PI;
		
		if(laser.timer <= 0){
			laser.markForRemoval();
		}
		laser.timer --;
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
			if(Math.abs(this.myChar.x - absorb.x) < 5 || absorb.scaleX<0.3){
				absorb.markForRemoval();
				this.invincible = 0;
				this.hitenemy = false;
				if(this.myEnergy.scaleX <= 1.8){
					this.myEnergy.scaleX += 0.01;
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
				y:this.stage.percentageOfHeight(1 - height),//[absolute height->]((this.characterYratio - 1)*this.myChar.y + this.stage.percentageOfHeight(1)*height)/this.characterYratio,
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
		
			if(Math.random() <0.4){
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

			if(Math.random() < 0.3){
				var enemy = new TGE.Sprite().setup({
					x:newPlatform[i].x + (Math.random()-0.5)*50,
					y:newPlatform[i].y + 10,//+	newPlatform[i].height,
					image:"enemy",
				})
				enemy.scaleY = enemy.scaleX = 0.4;
				enemy.y -= enemy.height*0.5*enemy.scaleX;
				enemy.setImage("enemy",1,2);
				if(Math.random() < 0.2){
					enemy.setSpriteIndex(0);
					//enemy.scaleX = enemy.scaleY;
				}
				else{
					enemy.setSpriteIndex(1);
				}

				
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
		if(this.charXPos <= platformSection.x + platformSection.width/2 && this.charXPos >= platformSection.x-platformSection.width/2){
			var platformPlane = platformSection.y - platformSection.height*0.1;
			
			//landing on the ground
			if(this.ySpeed >= 0 && !this.exhausted){
				
				if(this.myChar.y >= platformPlane && this.myChar.y <= platformPlane + this.ySpeed + this.downGravity + 10){
					this.ySpeed = 0;
					this.myChar.y = platformPlane;
					this.jump = 0;
				}
			}			
			
			//refresh dash on the ground
			if(this.myChar.y >= platformPlane && this.myChar.y <= platformPlane + this.dashRefreshHight){
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
		
		if(Math.random() < 0.1 && enemy.x < this.stage.percentageOfWidth(1) && this.boss.isAlive){
			this.instantiateTransmit(enemy.x,enemy.y,20,1);
		}
		
		//kill the enemy
		if(this.isDashing){
			if(Math.abs(enemy.y - this.myChar.y) < this.collideY && enemy.x < this.myChar.x + this.dashFowardDistance + this.collideX){
				

				this.instantiateExplosion(enemy.x,enemy.y,1+Math.random()*0.5,this.enemyExplosionShakingTime);

			
				enemy.markForRemoval();
				this.bossEnergy.scaleX -= 0.1;
				
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
		if (kill.y > this.stage.percentageOfHeight(0.1)){
		kill.y -=this.stage.percentageOfHeight(0.005);
		}
		
		if (kill.x < this.stage.percentageOfWidth(0.907)){
		kill.x += this.stage.percentageOfWidth(0.06);
		}
		
		kill.alpha -= 0.02;
		if (kill.alpha < 0.1){
		kill.markForRemoval();
		this.enemykill += 100;
		}
	},
	
	instantiateExplosion:function(xPos,yPos,scale,shakingTime){
				var explosion = new TGE.Sprite().setup({
					x:xPos,
					y:yPos,
					image:"explosion",
					scaleX: scale,
					scaleY: scale,
					rotation: Math.random()*360,
				})

				explosion.setImage("explosion",1,4);
				explosion.index = 0;
				explosion.setSpriteIndex(explosion.index);
				explosion.xPos = explosion.x + this.xDistance;
				this.getLayer("effect").addChild(explosion);
				explosion.addEventListener("update",this.updateExplosion.bind(this));

				if(this.shakeTimer < shakingTime){
					this.shakeTimer = shakingTime;
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
	
	contPlay:function()
	{
		
		this.fail = this.getLayer("button").addChild(new TGE.Text().setup({
        x:this.stage.percentageOfWidth(0.5),
        y:this.stage.percentageOfHeight(0.4),
        text:"You fell! Use your heart to continue?",
        font:"bold 36px Arial",
        color:"#fff"
		}));
		if(this.exhausted){
			this.fail.text = "You ran out of energy! Use your heart to continue?";
		}
		
		this.cont = this.getLayer("button").addChild(new TGE.Button().setup({
        x:this.stage.percentageOfWidth(0.4),
        y:this.stage.percentageOfHeight(0.55),
		mouseEnabled: true,
		width: 150,
        text:"Yes",
        font:"bold 36px Arial",
        color:"#fff",
		pressFunction: this.reviveCory.bind(this)
		}));
		
		this.over = this.getLayer("button").addChild(new TGE.Button().setup({
        x:this.stage.percentageOfWidth(0.6),
        y:this.stage.percentageOfHeight(0.55),
		mouseEnabled:true,
		width: 150,
        text:"No",
        font:"bold 36px Arial",
        color:"#fff",
		pressFunction: this.EndGame.bind(this)
		}));
	},
	
	reviveCory: function(){
		this.reviveTimer = 100;		
		this.myChar.ySpeed =0;
		this.myChar.rotation =0;
		this.fail.markForRemoval();
		this.cont.markForRemoval();
		this.over.markForRemoval();
		this.myEnergy.scaleX = 2;
		this.myChar.y = this.stage.percentageOfHeight(1.05);
		this.exhausted = false;
		this.downGravity = this.downGravityNormal;
	},
	
	updateRevive: function(elapsedTime){
		if(this.reviveTimer >10){
		this.risingSpeed = 10;
		
		this.myChar.y -= this.stage.percentageOfHeight(0.008);
		var p = this.getLayer("platform").numChildren();
			for (i = 0; i < p; i ++){
				var platform = this.getLayer("platform").getChildAt(i);
				platform.y += this.risingSpeed;
			}
			
		var t = this.getLayer("tree").numChildren();
			for (i = 0; i < t; i ++){
				var tree = this.getLayer("tree").getChildAt(i);
				tree.y += this.risingSpeed;
			}
		var e = this.getLayer("enemy").numChildren();
			for (i = 0; i < e; i ++){
				var enemy = this.getLayer("enemy").getChildAt(i);
				enemy.y += this.risingSpeed;
			}
		if (this.xSpeed < this.xSpeed_Normal){
			this.xSpeed += this.xSpeed_Normal * 0.05;
		}else{
			this.xSpeed = this.xSpeed_Normal
		}
		if(this.reviveTimer>=10){
		this.reviveTimer -= 1;
		}
		}
		if(this.reviveTimer <= 10){
			this.alive = true;
			this.beginning =10;
			this.reviveTimer -= 0.1;
		}else if (this.reviveTimer<=0){
			this.reviveTimer = 0;
		}
		
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