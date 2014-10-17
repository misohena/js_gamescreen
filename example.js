(function(global){
    if(!global.misohena){global.misohena = {};}
    var mypkg = global.misohena;

    mypkg.GameScreenExampleGame = {};
    mypkg.GameScreenExampleGame.create = function()
    {
        var img = document.createElement("img");
        img.setAttribute("width", 640);
        img.setAttribute("height", 480);
        img.setAttribute("src", "example.jpg");
        img.setAttribute("alt", "forest");
        return img;
    };
})(this);
