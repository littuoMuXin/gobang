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
    this._notice = window.notice;
    this._msgs = {
        'start': '比赛开始！',
        'reStart': '比赛重新开始！',
        'blackWin': '黑棋胜！',
        'whiteWin': '白棋胜！',
    };
}

/**
 * 初始化棋盘数据
 * @returns {Array} 初始棋盘数据
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
 * @param {Number} x 水平坐标
 * @param {Number} y 垂直坐标
 * @returns {Boolean} 初始棋盘数据
 */
Gobang.prototype._hasChess = function(x, y) {
    var _this = this;
    var hasChess = false;
    _this._chessDatas.forEach(function(item) {
        if (item.x === x && item.y === y) hasChess = true;
    });
    return hasChess;
};

/**
 * 下一步棋
 * @param {Number} x 水平坐标
 * @param {Number} y 垂直坐标
 * @param {Boolean} normal 正常下棋，不是撤销悔棋之类
 * @returns {Boolean} 是否成功下棋
 */
Gobang.prototype.goStep = function(x, y, normal) {
    var _this = this;
    if (_this._status) return false;
    if (_this._hasChess(x, y)) return false;
    _this._chessBoardDatas[x][y] = _this._role;
    var step = {
        x: x,
        y: y,
        role: _this._role
    };
    _this._chessDatas.push(step);
    // 存入 localstorage
    localStorage && (localStorage.chessDatas = JSON.stringify(_this._chessDatas));

    // 绘制棋子
    _this.renderer.renderStep(step);

    // 判断是否胜出
    if (_this._isWin(step.x, step.y)) {
        // 获胜
        _this._status = 1;
        var msg = _this._role ? _this._msgs.whiteWin : _this._msgs.blackWin;
        setTimeout(function() {
            _this._notice.showMsg(msg, 5000);
        }, 500);
    }
    // 切换角色
    _this._role = 1 - _this._role;
    // 清除悔棋数据
    if (normal) _this._resetStepData = [];
    return true;
};

/**
 * 悔一步棋
 */
Gobang.prototype.resetStep = function() {
    var _this = this;
    if (_this._chessDatas.length < 1) return;
    _this._status = 0; // 即使分出了胜负，悔棋后也回到了对战状态
    var lastStep = _this._chessDatas.pop();

    // 存入 localstorage
    localStorage && (localStorage.chessDatas = JSON.stringify(_this._chessDatas));
    // 修改棋盘数据
    _this._chessBoardDatas[lastStep.x][lastStep.y] = undefined;
    // 存储悔棋数据
    _this._resetStepData.push(lastStep);
    // 切换用户角色
    _this._role = 1 - _this._role;
    // 移除棋子
    _this.renderer.renderUndo(lastStep, _this._chessDatas);
};

/**
 * 撤销悔棋
 */
Gobang.prototype.reResetStep = function() {
    var _this = this;
    if (_this._resetStepData.length < 1) return;
    var lastStep = _this._resetStepData.pop();
    _this.goStep(lastStep.x, lastStep.y);

    // 绘制棋子
    _this.renderer.renderStep(lastStep);
};

/**
 * 判断某个单元格是否在棋盘上
 * @param {Number} x 水平坐标
 * @param {Number} y 垂直坐标
 * @returns {Boolean} 指定坐标是否在棋盘范围内
 */
Gobang.prototype._inRange = function(x, y) {
    return x >= 0 && x < this._gridNum && y >= 0 && y < this._gridNum;
};

/**
 * 判断在某个方向上有多少个同样的棋子
 * @param {Number} xPos 水平坐标
 * @param {Number} yPos 垂直坐标
 * @param {Number} deltaX 水平移动方向
 * @param {Number} deltaY 垂直移动方向
 * @returns {Number} 与给定位置棋子朝给定位置上计算得到的相同的棋子数量
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
 * @param {Number} x 水平坐标
 * @param {Number} y 垂直坐标
 * @param {Object} direction 方向
 * @returns {Boolean} 在某个方向上是否获胜
 */
Gobang.prototype._isWinInDirection = function(x, y, direction) {
    var _this = this;
    var count = 1;
    count += _this._getCount(x, y, direction.deltaX, direction.deltaY);
    count += _this._getCount(x, y, -1 * direction.deltaX, -1 * direction.deltaY);
    return count >= 5;
};

/**
 * 判断是否获胜
 * @param {Number} x 水平坐标
 * @param {Number} y 垂直坐标
 * @returns {Boolean} 是否获胜
 */
Gobang.prototype._isWin = function(x, y) {
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
        if (_this._isWinInDirection(x, y, directions[i])) {
            return true;
        }
    }
};

/**
 * 根据下棋数据恢复棋局
 * @param {Array} chessDatas 下棋数据数组
 */
Gobang.prototype.restore = function(chessDatas) {
    var _this = this;
    if (!chessDatas || chessDatas.length < 1) return;
    // 直接开始
    _this._status = 0;
    chessDatas.forEach(function(step) {
        _this.goStep(step.x, step.y);
    });
};

/**
 * 清除一切重新开始
 */
Gobang.prototype.clear = function() {
    var _this = this;
    _this._status = 0;
    _this._role = 0;
    if (_this._chessDatas.length < 1) return;

    // 清除棋子
    _this.renderer.renderClear();

    _this._chessDatas = [];
    localStorage && (localStorage.chessDatas = '');
    this._resetStepData = [];
    _this._chessBoardDatas = _this._initChessBoardDatas();
    _this._notice.showMsg(_this._msgs.reStart, 1000);
};

/**
 * 切换渲染器
 * @param {Object} renderer 渲染器对象
 */
Gobang.prototype.changeRenderer = function(renderer) {
    var _this = this;

    if (!renderer) return;

    _this.renderer = renderer;

    // 先清除棋盘，再根据当前数据绘制棋局状态
    renderer.renderClear();
    if (!renderer.chessBoardRendered) renderer.renderChessBoard();
    if (!renderer.eventsBinded) renderer.bindEvents(_this);
    _this._chessDatas.forEach(function(step) {
        renderer.renderStep(step);
    });
};

/**
 * 初始化
 * @param {Object} renderer 渲染器
 */
Gobang.prototype.init = function(renderer) {
    var _this = this;

    // 游戏开始
    setTimeout(function() {
        _this._notice.showMsg(_this._msgs.start, 1000);
    }, 1000);

    if (!renderer) throw new Error('缺少渲染器！');

    _this.renderer = renderer;
    renderer.renderChessBoard();
    renderer.bindEvents(_this);
};