/**
 * 五子棋对象构造函数
 */
function Gobang() {
    this._status = 0; // 棋局状态，0表示对战中，1表示已分胜负
    this._role = 0; // 下棋的角色，0表示黑棋，1表示白棋
    this._chessDatas = []; // 存放下棋数据
    this._resetStepData = []; // 存放悔棋数据
    this._gridNum = 15; // 棋盘行列数
    this._padding = 4; // 棋盘内边距
    this._gridWidth = 30; // 棋盘格宽度
    this._chessRadius = 13; // 棋子的半径
    this._chessBoardDatas = this._initChessBoardDatas();
    this._msgContainer = document.getElementById('msg');
    this._msgs = {
        'start': '比赛开始！',
        'reStart': '比赛重新开始！',
        'blackWin': '黑棋胜！',
        'whiteWin': '白棋胜！',
    };

    // DOM 相关
    this._gridDoms = []; // 存放棋盘 DOM
    this._chessboardContainer = document.getElementById('chessboard_container');

    // Canvas 相关
    this._chessCanvas = document.getElementById('chessboard_canvas');
    this._chessContext = this._chessCanvas.getContext('2d');
}

/**
 * 初始化棋盘数据
 */
Gobang.prototype._initChessBoardDatas = function() {
    var _this = this;
    var initDatas = new Array(_this._gridNum);
    for (var i = 0; i < _this._gridNum; i++) {
        initDatas[i] = new Array(_this._gridNum);
    }
    return initDatas;
};

/**
 * 判断一个位置是否有棋子
 */
Gobang.prototype._hasChess = function(position) {
    var _this = this;
    var hasChess = false;
    _this._chessDatas.forEach(function(item) {
        if (item === position) hasChess = true;
    });
    return hasChess;
};

/**
 * 在canvas里添加棋子
 */
Gobang.prototype._addChessInCanvas = function(position, role) {
    var _this = this;

    if (position === undefined || position === null) return;

    var x = _this._padding + ((position % _this._gridNum) + 0.5) * _this._gridWidth;
    var y = _this._padding + (parseInt((position / _this._gridNum), 10) + 0.5) * _this._gridWidth;
    _this._chessContext.beginPath();
    _this._chessContext.arc(x, y, _this._chessRadius, 0, 2 * Math.PI);
    if (role) {
        _this._chessContext.fillStyle = "#FFFFFF";
    } else {
        _this._chessContext.fillStyle = "#000000";
    }
    _this._chessContext.fill();
    _this._chessContext.closePath();
};

/**
 * 添加棋子
 */
Gobang.prototype._addChess = function(position) {
    var _this = this;

    if (position === undefined || position === null) return;

    // DOM
    var domGrid = _this._gridDoms[position];
    domGrid.className = 'chess-grid ' + (_this._role ? 'white-chess' : 'black-chess');

    // Canvas
    _this._addChessInCanvas(position, _this._role);
};

/**
 * 移除特定位置的棋子
 */
Gobang.prototype._removeChess = function(position, reDraw) {
    var _this = this;

    if (position === undefined || position === null) return;

    // DOM
    var domGrid = _this._gridDoms[position];
    domGrid.className = 'chess-grid';

    // Canvas
    this._chessCanvas.height = this._chessCanvas.height; // 快速清除画布
    if (_this._chessDatas.length < 1) return;
    // 重绘
    if (!reDraw) return;
    _this._chessDatas.forEach(function(p, i) {
        _this._addChessInCanvas(p, i % 2);
    });
};

/**
 * 下一步棋
 */
Gobang.prototype._goStep = function(position) {
    var _this = this;
    if (_this._hasChess(position)) return;
    _this._chessBoardDatas[(position % _this._gridNum)][parseInt((position / _this._gridNum), 10)] = _this._role;
    _this._chessDatas.push(position);
    // 存入 localstorage
    localStorage && (localStorage.chessDatas = JSON.stringify(_this._chessDatas));

    // 绘制棋子
    _this._addChess(position);
};

/**
 * 悔一步棋
 */
Gobang.prototype.resetStep = function(target) {
    var _this = this;
    if (_this._chessDatas.length < 1) return;
    _this._status = 0; // 即使分出了胜负，悔棋后也回到了对战状态
    var lastStep = _this._chessDatas.pop();
    _this._resetStepData.push(lastStep);

    _this._role = 1 - _this._role;

    // 移除棋子
    _this._removeChess(lastStep, true);
};

/**
 * 撤销悔棋
 */
Gobang.prototype.reResetStep = function() {
    var _this = this;
    if (_this._resetStepData.length < 1) return;
    var lastStep = _this._resetStepData.pop();
    _this._goStep(lastStep);

    // 绘制棋子
    _this._addChess(lastStep);

    _this._role = 1 - _this._role;
};

/**
 * 判断某个单元格是否在棋盘上
 */
Gobang.prototype._inRange = function(x, y) {
    return x >= 0 && x < this._gridNum && y >= 0 && y < this._gridNum;
}

/**
 * 判断在某个方向上有多少个同样的棋子
 * @return
 */
Gobang.prototype._getCount = function(xPos, yPos, deltaX, deltaY) {
    var _this = this;
    var count = 0;
    while (true) {
        xPos += deltaX;
        yPos += deltaY;
        if (!_this._inRange(xPos, yPos) || _this._chessBoardDatas[xPos][yPos] != _this._role)
            break;
        count++;
    }
    return count;
};

/**
 * 判断在某个方向上是否获胜
 * @param position 最后一步棋的位置
 * @param direction 方向
 * @return
 */
Gobang.prototype._isWinInDirection = function(position, direction) {
    var _this = this;
    var xPos = (position % _this._gridNum);
    var yPos = parseInt(position / _this._gridNum, 10);
    var count = 1;
    count += _this._getCount(xPos, yPos, direction.deltaX, direction.deltaY);
    count += _this._getCount(xPos, yPos, -1 * direction.deltaX, -1 * direction.deltaY);
    return count >= 5;
};

/**
 * 判断是否获胜
 */
Gobang.prototype._isWin = function(position) {
    var _this = this;
    var length = _this._chessDatas.length;
    if (length < 9) return 0;
    // 4种赢法：横、竖、正斜、反斜
    var directions = [{
        deltaX: 1,
        deltaY: 0
    }, {
        deltaX: 0,
        deltaY: 1
    }, {
        deltaX: 1,
        deltaY: 1
    }, {
        deltaX: 1,
        deltaY: -1
    }];
    for (var i = 0; i < 4; i++) {
        if (_this._isWinInDirection(position, directions[i])) {
            return true;
        }
    }
};

/**
 * 画棋盘
 */
Gobang.prototype._drawChessBoard = function() {
    var _this = this;

    // DOM
    var fragment = '';
    for (var i = 0; i < _this._gridNum * _this._gridNum; i++) {
        fragment += '<div class="chess-grid" attr-data="' + i + '"></div>';
    }
    _this._chessboardContainer.innerHTML = fragment;
    _this._gridDoms = _this._chessboardContainer.getElementsByClassName('chess-grid');

    // Canvas
    // 绘制一张棋盘图片作为背景，该背景始终不变，所以放在一个专用图层里
    var bgCanvas = document.getElementById('chessboard_bg_canvas');
    var bgContext = bgCanvas.getContext('2d');
    bgContext.strokeStyle = 'none'; //边框颜色
    var bgImg = new Image();
    bgImg.src = './imgs/board.jpg';
    bgImg.onload = function() {
        bgContext.drawImage(bgImg, 0, 0, 458, 458);
    }
};

/**
 * 展示消息
 */
Gobang.prototype._showMsg = function(msg, duration) {
    var _this = this;
    _this._msgContainer.innerHTML = msg;
    _this._msgContainer.className = 'msg-container show';
    setTimeout(function() {
        if (_this._msgContainer.className.indexOf('show') >= 0) {
            _this._msgContainer.className = 'msg-container';
        }
    }, duration || 0);
};

/**
 * 根据下棋数据恢复棋局
 */
Gobang.prototype.restore = function(chessDatas) {
    var _this = this;
    if (!chessDatas || chessDatas.length < 1) return;
    // 直接开始
    _this._status = 0;
    for (var i = 0; i < chessDatas.length; i++) {
        _this._goStep(chessDatas[i]);
        if (_this._isWin(chessDatas[i])) {
            // 获胜
            _this._status = 1;
            var msg = (_this.role ? '白' : '黑') + '棋胜';
            setTimeout(function() {
                alert(msg);
            }, 0);

            _this._role = 1 - _this._role;
        } else {
            // 继续下棋
            _this._role = 1 - _this._role;
        }
    }
};

/**
 * 清除一切重新开始
 */
Gobang.prototype.clear = function() {
    var _this = this;
    if (_this._chessDatas.length < 1) return;
    _this._status = 0;

    // 清除棋子
    _this._chessDatas.forEach(function(position) {
        _this._removeChess(position, false);
    });

    _this._chessDatas = [];
    localStorage && (localStorage.chessDatas = '');
    this._resetStepData = [];
    _this._chessBoardDatas = _this._initChessBoardDatas();
    _this._showMsg(_this._msgs.reStart, 1000);
};

/**
 * 初始化
 */
Gobang.prototype.init = function() {
    var _this = this;

    // 绘制棋盘单元格
    _this._drawChessBoard();

    // 游戏开始
    setTimeout(function() {
        _this._showMsg(_this._msgs.start, 1000);
    }, 1000);

    // 点击棋盘下棋
    // DOM
    _this._chessboardContainer.addEventListener('click', function(ev) {
        var target = ev.target;
        var position = target.getAttribute('attr-data') - 0;
        if (_this._status === 0) {
            _this._goStep(position);
            if (_this._isWin(position)) {
                // 获胜
                _this._status = 1;
                var msg = _this._role ? _this._msgs.whiteWin : _this._msgs.blackWin;
                setTimeout(function() {
                    _this._showMsg(msg, 5000);
                }, 500);
            } else {
                // 清除悔棋数据
                _this._resetStepData = [];
            }
            _this._role = 1 - _this._role;
        }
    }, false);

    // Canvas
    var chessShodowCanvas = document.getElementById('chessboard_shadow_canvas');
    var chessShodowContext = chessShodowCanvas.getContext('2d');
    _this._chessCanvas.addEventListener('mousemove', function(ev) {
        var xPos = ev.offsetX;
        var yPos = ev.offsetY;
        var i = Math.floor((xPos - _this._padding) / _this._gridWidth);
        var j = Math.floor((yPos - _this._padding) / _this._gridWidth);
        var x = _this._padding + (i + 0.5) * _this._gridWidth;
        var y = _this._padding + (j + 0.5) * _this._gridWidth;

        chessShodowCanvas.height = chessShodowCanvas.height;

        // 超出棋盘范围不要阴影效果
        if (!_this._inRange(i, j)) return;
        // 有棋子的地方不要阴影效果
        if (_this._chessBoardDatas[i][j] !== undefined) return;

        chessShodowContext.beginPath();
        chessShodowContext.arc(x, y, _this._gridWidth / 2, 0, 2 * Math.PI);
        chessShodowContext.fillStyle = "rgba(0, 0, 0, 0.2)";

        chessShodowContext.fill();
        chessShodowContext.closePath();
    }, false);
    _this._chessCanvas.addEventListener('click', function(ev) {
        var x = ev.offsetX;
        var y = ev.offsetY;
        var i = Math.floor((x - _this._padding) / _this._gridWidth);
        var j = Math.floor((y - _this._padding) / _this._gridWidth);
        var position = i + j * _this._gridNum;
        if (_this._status === 0) {
            _this._goStep(position);

            // 清除阴影
            chessShodowCanvas.height = chessShodowCanvas.height;

            if (_this._isWin(position)) {
                // 获胜
                _this._status = 1;
                var msg = _this._role ? _this._msgs.whiteWin : _this._msgs.blackWin;
                setTimeout(function() {
                    _this._showMsg(msg, 5000);
                }, 500);
            } else {
                // 清除悔棋数据
                _this._resetStepData = [];
            }
            _this._role = 1 - _this._role;
        }
    }, false);
};