/**
 * 负责 Canvas 版本的五子棋的渲染工作
 */

function CanvasRenderer(container) {
    this._gridNum = 15; // 棋盘行列数
    this._padding = 4; // 棋盘内边距
    this._gridWidth = 30; // 棋盘格宽度
    this._chessRadius = 13; // 棋子的半径
    this._container = container; // 容器
    this._context = container.getContext('2d');
    this.chessBoardRendered = false; // 是否渲染了棋盘
    this.eventsBinded = false; // 是否绑定了事件
}

/**
 * 判断某个单元格是否在棋盘上
 * @param x 水平坐标
 * @param y 垂直坐标
 */
CanvasRenderer.prototype._inRange = function(x, y) {
    return x >= 0 && x < this._gridNum && y >= 0 && y < this._gridNum;
};

/**
 * 绑定事件
 * @param controllerObj 控制器对象
 */
CanvasRenderer.prototype.bindEvents = function(controllerObj) {
    var _this = this;

    var chessShodowCanvas = document.getElementById('chessboard_shadow_canvas');
    var chessShodowContext = chessShodowCanvas.getContext('2d');
    // 鼠标移出画布时隐藏画阴影的画布
    document.body.addEventListener('mousemove', function(ev) {
        if (ev.target.nodeName !== 'CANVAS') {
            chessShodowCanvas.style.display = 'none';
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
        chessShodowCanvas.style.display = 'block';
        // 快速清除画布
        chessShodowCanvas.height = chessShodowCanvas.height;

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
            chessShodowCanvas.height = chessShodowCanvas.height;
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
    var bgCanvas = document.getElementById('chessboard_bg_canvas');
    var bgContext = bgCanvas.getContext('2d');
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
 * @param step 棋的位置
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
 * @param step     当前这一步棋的位置
 * @param allSteps 剩下的所有棋的位置
 */
CanvasRenderer.prototype.renderUndo = function(step, allSteps) {
    var _this = this;

    if (!step) return;
    this._container.height = this._container.height; // 快速清除画布
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
    this._container.height = this._container.height; // 快速清除画布
};