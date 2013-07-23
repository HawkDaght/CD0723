
GameOver = function(width,height)
{
	// Make sure to call the constructor for the superclass
    GameOver.superclass.constructor.apply(this,arguments);

    // Background
    this.backgroundColor = "#000";

    this.setupFade(1,"#fff");    

    // Try again


    if(TGE.Game.GetInstance().getExhausted()){
        this.addChild(new TGE.Button().setup({
            x:this.percentageOfWidth(0.5),
            y:this.percentageOfHeight(0.5),
            image:"cory_endScreen_exhausted",
            pressFunction:this.playAgain.bind(this)
        }));

    }
    else{
        this.addChild(new TGE.Button().setup({
            x:this.percentageOfWidth(0.5),
            y:this.percentageOfHeight(0.5),
            image:"cory_endScreen",
            pressFunction:this.playAgain.bind(this)
    }));
    }

	
	// Score
    this.addChild(new TGE.Text().setup({
        x:this.percentageOfWidth(0.5),
        y:this.percentageOfHeight(0.85),
        text:"YOUR SCORE: " + TGE.Game.GetInstance().getScore().toString(),
        font:"bold 36px Arial",
        color:"#fff"
    }));
	
	this.addChild(new TGE.Text().setup({
        x:this.percentageOfWidth(0.5),
        y:this.percentageOfHeight(0.95),
        text:"Click anywhere to play again!",
        font:"bold 24px Arial",
        color:"#fff"
	}));
}

GameOver.prototype =
{
	playAgainWithAd: function()
    {
        // Trigger an advertisement - the closing of the add will trigger the real play again function (playAgain2)
        var canvas = TGE.Game.GetInstance().mCanvasDiv;
        TGE.Advertisement.DisplayModalOverlayAd({
            parentDiv: canvas,
            adURL: canvas,
            closeButton: "assets/images/ad_close.png",
            adWidth: 300,
            adHeight: 250,
            overlayOpacity: 1,
            skipDelay: 0,
            closeCallback: this.playAgain.bind(this)
        });
	},

	playAgain: function()
    {
        this.close();
		TGE.Game.GetInstance().Replay();
	}
}
extend(GameOver,TGE.Window);

