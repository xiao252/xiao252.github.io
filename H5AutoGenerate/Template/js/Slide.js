/**
 * Created by Administrator on 2017-02-16.
 */
(function () {
    var Slide = function (customConfig) {
        if (!(this instanceof Slide)) return new Slide(customConfig)
        var params = customConfig || {};
        this.touchObj = params.touchObj || document;//滑动绑定的对象
        this.speed = params.speed || 1000;//动画运行时间
        this.effect = params.effect || 'fade';//动画效果
        this.distance = params.distance || 100;//滑动的距离
        this.direction = params.direction || 'vertical';//horizontal；滑动的方向
        this.musicSrc = params.musicSrc || 'music/music.mp3';//背景音乐路径;
        this.loop = params.loop || false;//是否循环；
        this.allowTouch = params.allowTouch || false;//允许滑动
        this.swipeEnable = true;//滑动；
        this.upEnable=true;
        this.downEnable=true;
        this.leftEnable=true;
        this.rightEnable=true;
        this.pageNum = null;//page数量
        this.isMusicData = params.isMusicData || false;//是否获取音乐信息
        this.musicPic = null;
        this.music = null;
        this.Event = new Object();
        this.pageId = params.pageId || 1;//默认显示页数
        this.holdTime = params.holdTime || 700;//长按时间
        this.loadpageNum = params.loadpageNum || 3;//
        window.addEventListener('load', function () {
            this.init();
        }.bind(this));
    }
    Slide.prototype.dispatchEvent = function (type, target, data) {
        var event = {};
        event.type = type;
        event.target = (target == undefined) ? this : target;
        event.data = data;
        if (this.Event[type] == undefined) {
            this.Event[type] = [];
        }
        for (var i = 0, len = this.Event[type].length; i < len; i++) {
            this.Event[type][i](event);
        }
    }
    Slide.prototype.addEventListener = function (type, fun) {
        if (this.Event[type] == undefined) {
            this.Event[type] = [];
        }
        this.Event[type].push(fun);
    }
    Slide.prototype.removeEventListener = function (type, fun) {
        delete this.Event[type];
    }
    Slide.prototype.init = function () {
        this.dispatchEvent('loaded');
        this.touchObj = (this.touchObj == document) ? document : this.touchObj;
        this.defaultPageInit();
        this.swipe();
        this.initMusic();
        this.pageNum = this.selAll('.page').length;
    };
    Slide.prototype.defaultPageInit = function () {
        var initpage = document.querySelector('.page:nth-child(' + this.pageId + ')');
        initpage.style.display = 'block';
        initpage.style.opacity = '1';
    };
    //dom查询;
    Slide.prototype.sel = function (str) {
        var c = document.querySelector(str);
        return c;
    };
    Slide.prototype.selAll = function (str) {
        var c = document.querySelectorAll(str);
        return c;
    };
    //触控事件添加;
    Slide.prototype.swipe = function () {
        var self = this;
        if (self.allowTouch == true) {
            if (self.direction == 'vertical') {
                self.on(this.touchObj, 'swipeUp swipeDown', function (event, type) {
                    if (self.swipeEnable == true) {
                        if (type == 'swipeUp') {
                            if(self.upEnable==true){
                                self.next();
                            }
                        }
                        else {
                            if(self.downEnable==true){
                                self.pre();
                            }
                        }
                    }
                })
            }
            else if (self.direction == 'horizontal') {
                self.on(this.touchObj, 'swipeLeft swipeRight', function (event, type) {
                    if (self.swipeEnable == true) {
                        if (type == 'swipeLeft') {
                            if(self.leftEnable==true){
                                self.next();
                            }
                        }
                        else {
                            if(self.rightEnable==true){
                                self.pre();
                            }
                        }
                    }

                })
            }
        }
    };
    //下一页;
    Slide.prototype.next = function () {
        var self = this;
        self.swipeEnable = false;
        self.pageId++;
        var curPage;
        var prePage;
        if (self.pageId > this.pageNum) {
            if (self.loop == false) {
                self.pageId--;
                self.swipeEnable = true;
                return;
            }
            self.pageId = 1;
            prePage = document.querySelector('.page:nth-child(' + (self.pageNum) + ')');
        }
        else {
            prePage = document.querySelector('.page:nth-child(' + (self.pageId - 1) + ')');
        }
        curPage = document.querySelector('.page:nth-child(' + (self.pageId) + ')');
        this.moveNext(curPage, prePage);
    };
    //上一页;
    Slide.prototype.pre = function () {
        var self = this;
        self.swipeEnable = false;
        this.pageId--;
        var curPage;
        var prePage;
        if (self.pageId < 1) {
            if (self.loop == false) {
                self.pageId++;
                self.swipeEnable = true;
                return;
            }
            self.pageId = this.pageNum;
            prePage = document.querySelector('.page:nth-child(1)');
        }
        else {
            prePage = document.querySelector('.page:nth-child(' + (self.pageId + 1) + ')');
        }
        curPage = document.querySelector('.page:nth-child(' + (self.pageId) + ')');
        this.movePre(curPage, prePage);
    };
    //下一页动画;
    Slide.prototype.moveNext = function (curPage, prePage) {
        curPage.style.display = 'block';
        prePage.style.display = 'block';
        if (this.effect == 'black') {
            curPage.style.animation = '' + this.effect + '1 ' + this.speed + 's ease 0.8s  1 both';
            prePage.style.animation = '' + this.effect + '2 ' + this.speed + 's ease 0s  1 both';
        }
        else if (this.effect == 'flip') {
            curPage.style.animation = '' + this.effect + '_' + this.direction + '1 ' + this.speed + 's ease 0s  1 both';
            prePage.style.animation = '' + this.effect + '_' + this.direction + '2 ' + this.speed + 's ease 0s  1 both';
        }
        else if (this.effect == 'fade') {
            curPage.style.animation = '' + this.effect + '1 ' + this.speed + 's linear 0s  1 both';
            prePage.style.animation = '' + this.effect + '2 ' + this.speed + 's linear 0s  1 both';
        }
        this.dispatchEvent('animationStart');
        AnimationHander(curPage, prePage, this);
    };
    //上一页动画;
    Slide.prototype.movePre = function (curPage, prePage) {
        var self = this;
        curPage.style.display = 'block';
        prePage.style.display = 'block';
        if (this.effect == 'black') {
            curPage.style.animation = '' + this.effect + '3 ' + this.speed + 's ease 0.8s  1 both';
            prePage.style.animation = '' + this.effect + '4 ' + this.speed + 's ease 0s  1 both';
        }
        else if (this.effect == 'flip') {
            curPage.style.animation = '' + this.effect + '_' + this.direction + '3 ' + this.speed + 's ease 0s  1 both';
            prePage.style.animation = '' + this.effect + '_' + this.direction + '4 ' + this.speed + 's ease 0s  1 both';
        }
        else if (this.effect == 'fade') {
            curPage.style.animation = '' + this.effect + '3 ' + this.speed + 's linear 0s  1 both';
            prePage.style.animation = '' + this.effect + '4 ' + this.speed + 's linear 0s  1 both';
        }
        this.dispatchEvent('animationStart');
        AnimationHander(curPage, prePage, this);
    };
    function AnimationHander(curPage, prePage, self) {
        var self = self;
        curPage.addEventListener('animationend', animationEndHandler);
        function animationEndHandler(event) {
            if (event.target.getAttribute('class') == 'page') {
                event.currentTarget.removeEventListener('animationend', animationEndHandler);
                prePage.style.display = 'none';
                self.swipeEnable = true;
                self.dispatchEvent('animationEnded');
            }
        }
    }

    //前往pageId页面;
    Slide.prototype.gotoPage = function (pageId) {
        var prePage = document.querySelector('.page:nth-child(' + this.pageId + ')');
        var curPage = document.querySelector('.page:nth-child(' + pageId + ')');
        if (!curPage) {
            alert('没有这个页面');
            return;
        }
        if (pageId > this.pageId) {
            this.moveNext(curPage, prePage);
        }
        else if (pageId < this.pageId) {
            this.movePre(curPage, prePage);
        }
        else {
            return;
        }
        this.pageId = pageId;

    };

    Slide.prototype.on = function (dom, type, fun) {
        var self = this;
        var fun = fun;
        var dom = (dom == document) ? dom : this.selAll(dom);
        var setId = undefined;
        var oldX, oldY, newX, newY;
        var isholdend = false;
        var events = {
            event: undefined,
            'hold': {
                'start': function () {
                    setId = setTimeout(function () {
                        var type = 'hold';
                        isholdend = true;
                        fun(events.event, type);
                    }, self.holdTime);
                },
                'end': function () {
                    clearTimeout(setId);
                    if (isholdend == true) {
                        var type = 'holdEnd';
                        fun(events.event, type);
                        isholdend = false;
                    }

                },
            },
            'swipeUp': {
                'start': swipeStart.bind(this),
                'end': function () {
                    swipeEnd();
                    if (newY - oldY < -self.distance && oldY != 'input') {
                        var type = 'swipeUp';
                        fun(events.event, type);
                    }
                }
            },
            'swipeDown': {
                'start': swipeStart.bind(this),
                'end': function () {
                    swipeEnd();
                    if (newY - oldY > self.distance && oldY != 'input') {
                        var type = 'swipeDown';
                        fun(events.event, type);
                    }
                },
                'type': 'swipeDown',
                'target': '',
            },
            'swipeLeft': {
                'start': swipeStart.bind(this),
                'end': function () {
                    swipeEnd();
                    if (newX - oldX < -self.distance && oldX != 'input') {
                        var type = 'swipeLeft';
                        fun(events.event, type);
                    }
                }
            },
            'swipeRight': {
                'start': swipeStart.bind(this),
                'end': function (event) {
                    swipeEnd(event);
                    if (newX - oldX > self.distance && oldX != 'input') {
                        var type = 'swipeRight';
                        fun(events.event, type);
                    }
                }
            }
        }
        if (dom == document) {
            dom.addEventListener('touchstart', eventsHander.bind(this));
            dom.addEventListener('touchend', eventsHander.bind(this));
        }
        else {
            for (var i = 0, len = dom.length; i < len; i++) {
                dom[i].addEventListener('touchstart', eventsHander.bind(this));
                dom[i].addEventListener('touchend', eventsHander.bind(this));
            }
        }

        function swipeEnd(event) {
            var event = events.event;
            newX = event.changedTouches[0].clientX;
            newY = event.changedTouches[0].clientY;

        }

        function swipeStart() {
            var event = events.event;
            oldX = event.touches[0].clientX;
            oldY = event.touches[0].clientY;
        }

        function eventsHander(event) {
            var types = type.split(' ');
            for (var i = 0, len = types.length; i < len; i++) {
                events.event = event;
                if (event.type == 'touchstart') {
                    events[types[i]]['start']();
                }
                else {
                    events[types[i]]['end']();
                }
            }

        }

    }
    Slide.prototype.initMusic = function () {
        var self = this;
        this.music = this.sel('#music');
        self.musicPic = this.sel('#musicPic');
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        try {
            var audioContext = new window.AudioContext();
        }
        catch (e) {
            console.log('你的浏览器不支持AudioContext');
        }
        if(this.isMusicData==true)
        {
            var acbs = audioContext.createMediaElementSource(self.music);
            var analyser = audioContext.createAnalyser();
            acbs.connect(analyser);
            analyser.connect(audioContext.destination);
            getData();
            function getData() {
                var array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);

                self.dispatchEvent('getmusicdata', null, array);
                window.requestAnimationFrame(getData);
            }
        }
        self.musicPlay();
        this.musicPic.addEventListener('touchend', function (event) {
            if (self.music.paused) {
                self.musicPlay();
            }
            else {
                self.musicPause();
            }
        })

    };
    Slide.prototype.musicPlay = function () {
        if (!this.music) {
            this.music = document.getElementById('music');
        }
        this.musicPic.className = 'musicPic';
        this.music.play();
    };
    Slide.prototype.musicPause = function () {
        this.musicPic.className = '';
        this.music.pause();
    };
    window.Slide = Slide;
})()


