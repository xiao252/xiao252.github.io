;(function (window,document) {
    var DragSort = function (options) {
        if(!(this instanceof DragSort))return new DragSort(options);
        this.itemArr = [];
        this.itemNode =[];
        this.el = options.el || ".item";
        this.imgWidth=options.imgWidth || 300;
        this.imgHeight=options.imgHeight || 180;
        this.imgMargin=options.imgMargin || 10;
        this.colNumber =options.colNumber || 4;
        this.onAlternate =options.onAlternate || null;
        this.index = null;
        function setCss(dom,left,top,width,height,index,opacity,transition) {
            dom.style.cssText="opacity:1;position: absolute;left:"+left+"px;top:"+top+"px;width:" +width +"px;height:" + height + "px;"+(transition?"transition: all .5s ease;":"")+"z-index:"+(index||1)+";opacity:"+(opacity||1)+";";
        }
        function getScrolWidth(){
            var noScroll, scroll,testDiv = document.createElement('div');
            testDiv.style.cssText = "position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;";
            noScroll = document.body.appendChild(testDiv).clientWidth;
            testDiv.style.overflowY = "scroll";
            scroll = testDiv.clientWidth;
            document.body.removeChild(testDiv);
            return noScroll-scroll;
        }
        window.onload = function(){
            this.init();
        }.bind(this);
        window.onresize = function () {
            this.mathPx();
        }.bind(this);
        if(DragSort.prototype.init == undefined) {
            DragSort.prototype.init = function () {
                this.itemNode = document.querySelectorAll(this.el);
                this.mathPx();
                this.drag(this.itemNode);
                for(var i=0,len=this.itemNode.length;i<len;i++){
                    var url = this.itemNode[i].children[0].getAttribute('url');
                    this.itemNode[i].children[0].setAttribute('src',url);
                }
            }
            DragSort.prototype.mathPx =function(){
                this.itemArr.length = 0;
                var documentWidth = document.documentElement.clientWidth + getScrolWidth();
                var boxWidth = documentWidth - documentWidth / 3;
                var boxLeft = (documentWidth - boxWidth) / 2;
                var newImgWidth = boxWidth / this.colNumber;
                var scale = this.imgWidth / newImgWidth;
                this.imgWidth = newImgWidth;
                this.imgHeight = this.imgHeight / scale;
                for (var k = 0; k < this.itemNode.length; k++) {
                    var left = (this.imgWidth + this.imgMargin) * (k % this.colNumber) + boxLeft;
                    var top = (this.imgHeight + this.imgMargin) * Math.floor(k / this.colNumber);
                    this.itemNode[k].setAttribute('index', k);
                    setCss(this.itemNode[k], left, top,this.imgWidth,this.imgHeight, 1, 1, false);
                    this.itemArr.push({
                        x: left,
                        y: top,
                        mx: left + this.imgWidth,
                        my: top + this.imgHeight
                    });
                }
            }
            DragSort.prototype.drag = function(itemNode){
                var _this = this;
                var left;
                var top;
                var isMouseDown = false;
                for(var i =0,len=itemNode.length;i<len;i++){
                    itemNode[i].addEventListener('mousedown',mousedownFun);
                    itemNode[i].addEventListener('mouseup',mouseupFun);
                    function mousedownFun(ev){
                        ev.preventDefault();
                        isMouseDown=true;
                        _this.index=parseInt(this.getAttribute('index'));
                        left = (ev.clientX-this.offsetLeft);
                        top =(ev.clientY-this.offsetTop);
                    }
                    function mouseupFun(ev) {
                        isMouseDown=false;
                        setCss(this,_this.itemArr[_this.index].x,_this.itemArr[_this.index].y,_this.imgWidth,_this.imgHeight,1,1,true);
                    }
                }
                document.addEventListener('mousemove',mousemoveFun);
                function mousemoveFun(ev) {
                    if(!isMouseDown){return false;}
                    var thisDom = document.querySelector(_this.el+'[index="'+_this.index+'"]');
                    setCss(thisDom,ev.clientX-left,ev.clientY-top,_this.imgWidth,_this.imgHeight,99999,0.6,false);
                    _this.alternate(ev,_this.index);
                }
            }
            DragSort.prototype.alternate = function(ev,index){
                for(var i=0,len=this.itemArr.length;i<len;i++){
                    if(
                        ev.clientX > this.itemArr[i].x &&
                        ev.clientX < this.itemArr[i].mx &&
                        ev.clientY >  this.itemArr[i].y &&
                        ev.clientY <  this.itemArr[i].my &&
                        i!=index
                    ){
                        if(index<i){//下移
                            for(var j=index;j<i;j++){
                                var tdom = document.querySelector(this.el+"[index='"+(j+1)+"']");
                                setCss(tdom,this.itemArr[j].x,this.itemArr[j].y,this.imgWidth,this.imgHeight,1,1,true);
                            }
                            var dombox = document.querySelector(this.el+"[index='"+(index)+"']");
                            for(var x=index+1;x<=i;x++){
                                document.querySelector(this.el+"[index='"+(x)+"']").setAttribute('index',x-1);
                            }
                            dombox.setAttribute('index',i);
                        }else if(index>i){//上移
                            for(var j=index;j>i;j--){
                                var tdom = document.querySelector(this.el+"[index='"+(j-1)+"']");
                                setCss(tdom,this.itemArr[j].x,this.itemArr[j].y,this.imgWidth,this.imgHeight,1,1,true);
                            }
                            var dombox = document.querySelector(this.el+"[index='"+(index)+"']");
                            for(var x=index-1;x>=i;x--){
                                document.querySelector(this.el+"[index='"+(x)+"']").setAttribute('index',x+1);
                            }
                            dombox.setAttribute('index',i);
                        }
                        if(this.onAlternate){
                            this.onAlternate(this.index,i);
                        }
                        this.index = i;
                    }
                }
            }
            DragSort.prototype.nodeMove = function () {
                for(var j=index;j<i;j++){
                    var tdom = document.querySelector(this.el+"[index='"+(j+1)+"']");
                    setCss(tdom,this.itemArr[j].x,this.itemArr[j].y,this.imgWidth,this.imgHeight,1,1,true);
                }
                var dombox = document.querySelector(this.el+"[index='"+(index)+"']");
                for(var x=index+1;x<=i;x++){
                    document.querySelector(this.el+"[index='"+(x)+"']").setAttribute('index',x-1);
                }
                dombox.setAttribute('index',i);
            }
        }
    }
    window.DragSort  =  DragSort;
})(window,document);