/**
 * 负责 Canvas 版本的五子棋的渲染工作
 */

/**
 * Canvas 版本五子棋渲染器构造函数
 * @param {Object} container 渲染所在的 DOM 容器
 */
function CanvasRenderer(container) {
    this._chessBoardWidth = 450; // 棋盘宽度
    this._chessBoardPadding = 4; // 棋盘内边距
    this._gridNum = 15; // 棋盘行列数
    this._padding = 4; // 棋盘内边距
    this._gridWidth = 30; // 棋盘格宽度
    this._chessRadius = 13; // 棋子的半径
    this._container = container; // 创建 canvas 的 DOM 容器
    this.chessBoardRendered = false; // 是否渲染了棋盘
    this.eventsBinded = false; // 是否绑定了事件
    this._init();
}

/**
 * 初始化操作，创建画布
 */
CanvasRenderer.prototype._init = function() {
    var _this = this;

    var width = _this._chessBoardWidth + _this._chessBoardPadding * 2;

    // 创建绘制背景的画布
    _this._bgCanvas = document.createElement('canvas');
    _this._bgCanvas.setAttribute('width', width);
    _this._bgCanvas.setAttribute('height', width);

    // 创建绘制阴影的画布
    _this._shadowCanvas = document.createElement('canvas');
    _this._shadowCanvas.setAttribute('width', width);
    _this._shadowCanvas.setAttribute('height', width);

    // 创建绘制棋子的画布
    _this._chessCanvas = document.createElement('canvas');
    _this._chessCanvas.setAttribute('width', width);
    _this._chessCanvas.setAttribute('height', width);

    // 在容器中插入画布
    _this._container.appendChild(_this._bgCanvas);
    _this._container.appendChild(_this._shadowCanvas);
    _this._container.appendChild(_this._chessCanvas);

    // 棋子的绘图环境
    _this._context = _this._chessCanvas.getContext('2d');
};

/**
 * 判断某个单元格是否在棋盘上
 * @param {Number} x 水平坐标
 * @param {Number} y 垂直坐标
 * @returns {Boolean} 指定坐标是否在棋盘范围内
 */
CanvasRenderer.prototype._inRange = function(x, y) {
    return x >= 0 && x < this._gridNum && y >= 0 && y < this._gridNum;
};

/**
 * 绑定事件
 * @param {Object} controllerObj 控制器对象
 */
CanvasRenderer.prototype.bindEvents = function(controllerObj) {
    var _this = this;

    var chessShodowContext = _this._shadowCanvas.getContext('2d');
    // 鼠标移出画布时隐藏画阴影的画布
    document.body.addEventListener('mousemove', function(ev) {
        if (ev.target.nodeName !== 'CANVAS') {
            _this._shadowCanvas.style.display = 'none';
        }
    }, false);
    // 鼠标移出画布时隐藏画阴影的画布
    _this._container.addEventListener('mousemove', function(ev) {
        var xPos = ev.offsetX;
        var yPos = ev.offsetY;
        var i = Math.floor((xPos - _this._padding) / _this._gridWidth);
        var j = Math.floor((yPos - _this._padding) / _this._gridWidth);
        var x = _this._padding + (i + 0.5) * _this._gridWidth;
        var y = _this._padding + (j + 0.5) * _this._gridWidth;

        // 显示画阴影的画布
        _this._shadowCanvas.style.display = 'block';
        // 快速清除画布
        _this._shadowCanvas.height = _this._shadowCanvas.height;

        // 超出棋盘范围不要阴影效果
        if (!_this._inRange(i, j)) return;
        // 有棋子的地方不要阴影效果
        if (controllerObj._chessBoardDatas[i][j] !== undefined) return;

        chessShodowContext.beginPath();
        chessShodowContext.arc(x, y, _this._gridWidth / 2, 0, 2 * Math.PI);
        chessShodowContext.fillStyle = 'rgba(0, 0, 0, 0.2)';

        chessShodowContext.fill();
        chessShodowContext.closePath();
    }, false);
    _this._container.addEventListener('click', function(ev) {
        var x = ev.offsetX;
        var y = ev.offsetY;
        var i = Math.floor((x - _this._padding) / _this._gridWidth);
        var j = Math.floor((y - _this._padding) / _this._gridWidth);
        var success = controllerObj.goStep(i, j, true);
        if (success) {
            // 清除阴影
            _this._shadowCanvas.height = _this._shadowCanvas.height;
        }
    }, false);
    _this.eventsBinded = true;
};

/**
 * 渲染棋盘
 */
CanvasRenderer.prototype.renderChessBoard = function() {
    var _this = this;

    // 绘制一张棋盘图片作为背景，该背景始终不变，所以放在一个专用图层里
    var bgContext = _this._bgCanvas.getContext('2d');
    bgContext.strokeStyle = 'none'; //边框颜色
    var bgImg = new Image();
    bgImg.src = './imgs/board.jpg';
    bgImg.onload = function() {
        bgContext.drawImage(bgImg, 0, 0, 458, 458);
    };
    _this.chessBoardRendered = true;
};

/**
 * 渲染一步棋子
 * @param {Object} step 棋的位置
 */
CanvasRenderer.prototype.renderStep = function(step) {
    var _this = this;

    if (!step) return;

    var x = _this._padding + (step.x + 0.5) * _this._gridWidth;
    var y = _this._padding + (step.y + 0.5) * _this._gridWidth;
    _this._context.beginPath();
    _this._context.arc(x, y, _this._chessRadius, 0, 2 * Math.PI);
    if (step.role) {
        _this._context.fillStyle = '#FFFFFF';
    } else {
        _this._context.fillStyle = '#000000';
    }
    _this._context.fill();
    _this._context.closePath();
};

/**
 * 悔一步棋子
 * @param {Object} step 当前这一步棋的位置
 * @param {Array} allSteps 剩下的所有棋的位置
 */
CanvasRenderer.prototype.renderUndo = function(step, allSteps) {
    var _this = this;

    if (!step) return;
    _this._chessCanvas.height = _this._chessCanvas.height; // 快速清除画布
    if (allSteps.length < 1) return;
    // 重绘
    allSteps.forEach(function(p) {
        _this.renderStep(p);
    });
};

/**
 * 清除所有棋子
 */
CanvasRenderer.prototype.renderClear = function() {
    this._chessCanvas.height = this._chessCanvas.height; // 快速清除画布
};