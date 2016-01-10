/*©2010 Groinup*/
var timeoutIDs = [], intervalIDs = [];

var _setTimeout = setTimeout;
setTimeout = function (func, delay) {
    var id = _setTimeout(func, delay);
    timeoutIDs.push(id);
    return id;
};

var _setInterval = setInterval;
setInterval = function (func, delay) {
    var id = _setInterval(func, delay);
    intervalIDs.push(id);
    return id;
};

function cancelAllTimer() {
    for (var i = 0; i < timeoutIDs.length; i++)
        clearTimeout(timeoutIDs[i]);
    for (var i = 0; i < intervalIDs.length; i++)
        clearInterval(intervalIDs[i]);

    timeoutIDs.length = intervalIDs.length = 0;
}

setInterval('scrollTo(0,0)', 10); var bodyHTML = document.body.innerHTML; document.body.innerHTML = ''; if (location.href.indexOf('#home') < 0) location.replace('index.html'); else { location.replace('#'); window.onload = function () { init(); } } function init(scoreValue) {
    document.body.innerHTML = bodyHTML;
    /*主体部分*/
    /**************************************************************************/

    //游戏结束
    if (scoreValue != null) {
        var goBox = $('goBox');
        goBox.style.display = 'block';
        if (scoreValue) goBox.className = 'win';
        else goBox.className = 'lose';

        $('againBt').ontouchend = function () { init(); };
        $('homeBt').ontouchend = function () { location.replace('index.html#loaded'); };

        return;
    }

    //游戏主体
    $('main').style.display = 'block';
    $('backBt').ontouchend = function (e) {
        if (confirm('您确定要退出游戏吗?')) location.replace('index.html#loaded');
        e.stopPropagation();
    };

    document.body.ontouchstart = document.body.ontouchmove = function (e) { e.preventDefault(); };

    var peelList = [];
    var thiefList = [];

    var level = 1;
    var levelChanging = false;

    var score = new function () {
        var scoreBox = $('scorebox');
        var value = 0;

        this.goal = function (cnt) {
            value += 5 + 5 * cnt;
            setScore();
        };

        this.die = function (cnt) {
            value += 50 + 5 * cnt;
            setScore();
        };

        this.refuel = function () {
            value += 100;
            setScore();
        };

        this.getDelay = function () {
            return 5000 + 2000000 / (value + 1000);
        };

        this.getValue = function () {
            return value;
        };

        setScore();

        function setScore() {
            var vStr = value + '';
            scoreBox.innerHTML = '';
            for (var i = 0; i < vStr.length; i++) {
                var num = document.createElement('div');
                num.className = 'n' + vStr[i];
                scoreBox.appendChild(num);
            }
        }

    } ();

    var geng3 = new function () {
        var div = $('geng3');
        var hpbar = $('hpbar');

        var fullHp, hp;
        fullHp = hp = 5;
        var x = 240;

        var touchController = new function () {
            var leftBt = $('leftBt');
            var rightBt = $('rightBt');
            var throwBt = $('throwBt');
            var cv = 0; //current velocity

            //move controller
            var mc = new function () {
                var time;

                this.goLeft = function () {
                    this.style.opacity = 1;
                    cv = -3;
                    time = 1.5;
                    move(cv);
                };

                this.goRight = function () {
                    this.style.opacity = 1;
                    cv = 3;
                    time = 1.5;
                    move(cv);
                };

                this.stop = function () {
                    this.style.opacity = 0.8;
                    time = 0.3;
                };

                setInterval(change, 50);

                function change() {
                    if (cv) {
                        if (time < 1 || abs(cv) < 30) cv *= time;
                        move(cv);
                    }
                }


            } ();

            leftBt.ontouchstart = mc.goLeft;
            rightBt.ontouchstart = mc.goRight;

            leftBt.ontouchend = rightBt.ontouchend = mc.stop;

            throwBt.ontouchstart = function () {
                this.style.opacity = 1;
            };

            throwBt.ontouchend = function () {
                this.style.opacity = 0.8;
                throwPeel(cv * 5);
            };
        } ();

        var ready = false;
        var timeout;

        this.getX = function () { return x; };

        this.hurt = function () {
            ready = false;
            div.className = 'hurt';
            clearTimeout(timeout);

            if (setHp(-1)) timeout = setTimeout(eat, 1000);
        };

        this.addHp = function (n) {
            ready = false;
            div.className = 'refuel';
            setHp(n);

            clearTimeout(timeout);
            timeout = setTimeout(eat, 1000);
        }
        eat();

        function eat() {
            div.className = 'eat';

            timeout = setTimeout(finish, 500);

            function finish() {
                div.className = 'hold';
                ready = true;
            }
        }

        function throwPeel(mx) {
            if (!ready || levelChanging) return;

            ready = false;
            div.className = 'throw';

            var tx = x + mx;

            if (tx > 440) tx = 440;
            else if (tx < 40) tx = 40;

            new Peel(x + 30, tx);

            timeout = setTimeout(eat, 500);
        }

        function move(mx) {
            x += mx;
            if (x < 40) x = 40;
            else if (x > 440) x = 440;

            div.style.left = x + 'px';
        }

        function setHp(n) {
            hp += n;
            if (hp > fullHp)
                hp = fullHp;
            else if (hp <= 0) {
                controller.gameOver();
                return false;
            }
            hpbar.style.width = 114 * hp / fullHp + 'px';
            return true;
        }
    } ();

    var buildings = new function () {
        var _this = this;

        var buildingsholder = $('buildingsholder');
        var wood = $('stage');

        var counts = [];
        var leftsList = [
        null,
        [260],
        [140, 290],
        [100, 260, 340],
        [90, 170, 250, 370],
        [60, 170, 250, 320, 420]
    ];

        var lefts;
        var lastbuildings;

        this.stage = null;

        this.nextLevel = function (handle) {
            var newbuildings = createBuildings();

            var vel = 12;
            var cx = 480;
            var interval = setInterval(move, 50);

            function move() {
                cx -= 12;

                if (cx <= 0) {
                    cx = 0;
                    lastbuildings = newbuildings;
                    clearInterval(interval);
                    handle();
                }
                else lastbuildings.style.left = cx - 480 + 'px';

                newbuildings.style.left = cx + 'px';
                wood.style.backgroundPosition = cx - 480 + 'px 107px';

            }

        };

        this.shock = function (handle) {
            var n = random(lefts.length);
            var building = lastbuildings.childNodes[n + 1];
            building.className = 'b' + building.classID + ' shock';

            counts[n]++;

            setTimeout(stop, 2000);

            function stop() {
                if (--counts[n] == 0) building.className = 'b' + building.classID;
                handle(lefts[n]);
            }
        };

        lastbuildings = createBuildings(true);

        function createBuildings(start) {
            var buildings = document.createElement('div');

            buildings.style.left = start ? '0px' : '480px';
            buildingsholder.appendChild(buildings);

            lefts = leftsList[level];

            var stage = _this.stage = document.createElement('div');
            stage.className = 'stagex';

            buildings.appendChild(stage);

            for (var i = 0; i < lefts.length; i++) {
                counts[i] = 0;
                var building = document.createElement('div');
                var rnd = random(3)
                building.className = 'b' + rnd;
                building.classID = rnd;
                building.style.left = lefts[i] + 'px';
                buildings.appendChild(building);
            }

            return buildings;
        }
    } ();

    var controller = new function () {
        var levelReady = false;

        var amts = [null, 2, 4, 8, 12, 16];

        this.gameOver = function () {
            gameFinish(false);
        };

        this.nextLevel = function () {
            if (levelReady) {
                levelReady = false;
                levelChanging = true;
                setTimeout(nextLevel, 2000);
            }
        };

        var i = 0;
        createThief();
        function createThief() {
            if (i >= amts[level]) {
                i = 0;
                levelReady = true;
                return;
            }
            if (level > 1 && i % 7 == 1) new Heart();
            new Thief();
            setTimeout(createThief, score.getDelay());
            i++;
        }

        function nextLevel() {
            if (++level > 5) {
                gameFinish(true);
                return;
            }

            buildings.nextLevel(finishChanging);

            while (peelList.length) peelList[0].dispose();

            function finishChanging() {
                levelChanging = false;
                createThief();
            }
        }

        function gameFinish(win) {
            cancelAllTimer();
            init(win);
        }
    } ();

    function Thief() {
        var _this = this;

        var stagex = buildings.stage;
        var stage = $('stage');

        var toLeft;

        var div = document.createElement('div');
        div.innerHTML = '<div class="firebg"></div><div class="thiefm"><div></div></div>';

        var hp = 5;

        var timeout, interval;

        var cntGoal = 0;

        var x;
        var y = 145;
        var vel = 1;
        var direct = random(2);
        div.className = 'thief jump' + (direct ? 'left' : 'right');

        this.check = check;

        buildings.shock(jumpOut);

        function jumpOut(left) {
            x = left;
            var para = new Parabola(-0.6, 12, 145);

            var i = 0;
            interval = setInterval(jump, 50);

            function jump() {
                if (i == 0) stagex.appendChild(div);
                else if (i == 10) stage.appendChild(div);
                else if (i > 20) {
                    clearInterval(interval);
                    thiefList.push(_this);
                    move();
                    return;
                }

                y = para.getY(i);
                setPos();
                i++;
            }
        }

        function move() {
            var mx = random(200) - 100;

            if (x + mx > 440) mx = 440 - x;
            else if (x + mx < 40) mx = 40 - x;

            var v;

            if (mx > 0) {
                toLeft = false;
                div.className = 'thief right';
                v = vel;
            }
            else {
                toLeft = true;
                div.className = 'thief left';
                v = -vel;
            }


            var stepAmt = floor(abs(mx / vel));

            var i = 0;
            interval = setInterval(step, 50);

            function step() {
                if (i > stepAmt) {
                    clearInterval(interval);
                    if (random(4)) watch();
                    else move();
                    return;
                }

                x += v;

                setPos();
                checkSearch();

                i++;
            }
        }

        function watch() {
            div.className = 'thief watch';

            var func = random(4) ? fire : move;

            timeout = setTimeout(func, 1000);
        }

        function fire() {
            div.className = 'thief fire';

            timeout = setTimeout(doFire, 2000);

            function doFire() {
                timeout = setTimeout(move, 1000);
                new Bullet(x, geng3.getX());
            }
        }

        function hurt(peel) {
            clearInterval(interval);
            clearTimeout(timeout);

            var px = peel.x;

            var fullDeg;

            if (toLeft) {
                //向左
                fullDeg = -120;
                fly(x, x - 60);
            }
            else {
                //向右
                fullDeg = 120;
                fly(x, x + 60);
            }

            function fly(sx, ex) {
                if (ex > 440) {
                    ex = 440;
                    toLeft = true;
                }
                else if (ex < 40) {
                    ex = 40;
                    toLeft = false;
                }

                var vx = (ex - sx) / 10;
                var para = new Parabola(-1, 10, 123);

                var i = 0;
                interval = setInterval(move, 50);
                move();

                function move() {
                    if (i == 0) div.className = 'thief hurt';
                    else if (i > 10) {
                        clearInterval(interval);
                        land();
                        return;
                    }

                    x += vx;
                    y = para.getY(i);

                    div.style.webkitTransform = 'rotate(' + i / 10 * fullDeg + 'deg)';
                    setPos();

                    i++;
                }
            }

            function land() {
                y = 145;
                div.style.webkitTransform = '';
                setPos();
                if (--hp <= 0) {
                    die();
                    return;
                }
                div.className = 'thief hurtland';
                timeout = setTimeout(move, 1000);
                if (checkSearch()) cntGoal++;
                else cntGoal = 0;
                score.goal(cntGoal);
            }
        }

        function die() {
            div.className = 'thief die';
            removeFrom(thiefList, _this);

            if (!thiefList.length) controller.nextLevel();

            score.die(cntGoal);

            setTimeout(remove, 1000);

            function remove() {
                stage.removeChild(div);
            }
        }

        function checkSearch() {
            for (var i = 0; i < peelList.length; i++)
                if (check(peelList[i])) return true;

            return false;
        }

        function check(peel) {
            if (abs(peel.x - x) < 25) {
                hurt(peel);
                peel.goal();
                return true;
            }
            else return false;
        }

        function setPos() {
            div.style.left = x + 'px';
            div.style.bottom = y + 'px';
        }
    }


    function Bullet(sx, ex) {
        var dx = ex - sx;
        var dy = -145;
        var vel = 5;

        var x = sx;
        var y = 145;

        var dxy = sqrt(sqr(dx) + sqr(dy));

        var vx = dx / dxy * vel;
        var vy = dy / dxy * vel;

        var bullets = $('bullets');
        var div = document.createElement('div');
        div.innerHTML = '<div></div>';
        setPos();
        bullets.appendChild(div);

        var amt = floor(abs(dx / vx));
        var i = 0;
        var interval = setInterval(move, 50);

        function move() {
            if (i > amt) {
                if (abs(ex - geng3.getX()) < 35) geng3.hurt();
                bullets.removeChild(div);
                clearInterval(interval);
                return;
            }

            x += vx;
            y += vy;
            setPos();

            i++;
        }

        function setPos() {
            div.style.left = x + 'px';
            div.style.bottom = y + 'px';
        }
    }

    function Peel(sx, ex) {
        var _this = this;
        var peels = $('peels');

        var img = document.createElement('img');
        img.src = 'images/peel.png';

        peels.appendChild(img);

        var w = img.offsetWidth;
        var h = img.offsetHeight;

        var x = sx;
        var y = 20;

        var fullDeg = 720 * (random(2) ? 1 : -1);

        var vx = (ex - sx) / 20;

        var para = new Parabola(-1.35, 33, 20);

        var i = 0;
        var interval = setInterval(move, 50);
        var timeout;

        this.goal = function () {
            clearTimeout(timeout);
            flash();
        };

        this.dispose = dispose;

        function move() {
            if (i > 20) {
                _this.x = x;

                peelList.push(_this);

                for (var j = 0; j < thiefList.length; j++)
                    thiefList[j].check(_this);

                startTimer();

                clearInterval(interval);
                return;
            }

            x += vx;
            y = para.getY(i);

            var deg = i / 20 * fullDeg;
            var zoom = 0.5 + (20 - i) / 40;
            setPos(deg, zoom);

            i++;
        }

        function startTimer() {
            timeout = setTimeout(flash, 8000);
        }

        function flash() {
            img.className = 'flash';

            timeout = setTimeout(dispose, 2000);
        }

        function dispose() {
            clearTimeout(timeout);
            removeFrom(peelList, _this);
            peels.removeChild(img);
        }

        function setPos(deg, zoom) {
            img.style.left = x + 'px';
            img.style.bottom = y + 'px';
            img.style.width = w * zoom + 'px';
            img.style.height = h * zoom + 'px';
            img.style.marginLeft = -w * zoom / 2 + 'px';

            img.style.webkitTransform = 'rotate(' + deg + 'deg)';

        }

    }

    function Heart() {
        var hhold = $('hhold');
        var div = document.createElement('div');

        var vel = 4;

        var x = random(400) + 40;
        var y = 270;

        div.style.left = x + 'px';
        hhold.appendChild(div);


        var interval = setInterval(move, 50);
        move();

        function move() {
            if (y < 0) {
                dispose();
                return;
            }

            y -= vel;
            div.style.bottom = y + 'px';

            if (y < 80 && abs(x - geng3.getX()) < 90) {
                geng3.addHp(1);
                score.refuel();
                dispose();
            }
        }

        function dispose() {
            clearInterval(interval);
            hhold.removeChild(div);
        }

    }

    function Parabola(a, b, c) {
        this.getY = function (x) {
            return a * sqr(x) + b * x + c;
        };
    }

    /**************************************************************************/
    /*通用函数*/
    function $(id) { return document.getElementById(id); } function sqr(x) { return x * x; } function sqrt(x) { return Math.sqrt(x); } function ranges(x, from, to) { return ((x >= from && x <= to) || (x >= to && x <= from)); } function abs(x) { return Math.abs(x); } function random(x) { return floor(Math.random() * x); } function removeFrom(arr, item) { for (var i = 0; i < arr.length; i++) if (arr[i] == item) { arr.splice(i, 1); break; } } function power(x, n) { var v = 1; for (var i = 0; i < n; i++) v *= x; return v; } function floor(x) { return Math.floor(x); }
}