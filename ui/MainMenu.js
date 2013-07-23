
MainMenu = function(width,height)
{
    // Make sure to call the constructor for the superclass
    MainMenu.superclass.constructor.apply(this,arguments);

    this.backgroundColor = "#000";

    // Fade in
    this.setupFade(0.5,"#fff");
	this.addChild(new TGE.Button().setup({
        x:this.percentageOfWidth(0.5),
        y:this.percentageOfHeight(0.5),
        image:"cory_startScreen",
        pressFunction:this.playGame.bind(this)
    }));
	
	 this.addChild(new TGE.Text().setup({
        x:this.percentageOfWidth(0.5),
        y:this.percentageOfHeight(0.85),
		text:"Click anywhere to start!",
		font:"bold 24px Arial",
		color:"#444"
    }));
	
	// Logo
    /*this.addChild(new TGE.Sprite().setup({
        x:this.percentageOfWidth(0.5),
        y:this.percentageOfHeight(0.24),
        image:"mainmenu_logo"
    }));*/

    // Tresensa/HTML5 logo
    /*this.addChild(new TGE.Button().setup( {
     image:"tresensaLogo",
     x:this.pixelsFromRight(110),
     y:this.pixelsFromBottom(75),
     pressFunction:MainMenu.prototype.tresensaPlug.bind(this)
     }));*/
}

MainMenu.prototype =
{
    playGame: function()
    {
        this.close();
        TGE.Game.GetInstance().PlayGame();
    }
}
extend(MainMenu,TGE.Window);