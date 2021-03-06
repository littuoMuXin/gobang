/**
 * 负责 DOM 版本的五子棋的渲染工作
 */

/**
 * Dom 版本五子棋渲染器构造函数
 * @param {Object} container 渲染所在的 DOM 容器
 */
function DomRenderer(container) {
    this._chessBoardWidth = 450; // 棋盘宽度
    this._chessBoardPadding = 4; // 棋盘内边距
    this._gridNum = 15; // 棋盘行列数
    this._gridDoms = []; // 存放棋盘 DOM
    this._chessboardContainer = container; // 容器
    this.chessBoardRendered = false; // 是否渲染了棋盘
    this.eventsBinded = false; // 是否绑定了事件
}

/**
 * 绑定事件
 * @param {Object} controllerObj 控制器对象
 */
DomRenderer.prototype.bindEvents = function(controllerObj) {
    var _this = this;

    _this._chessboardContainer.addEventListener('click', function(ev) {
        var target = ev.target;
        var attrData = target.getAttribute('attr-data');
        if (attrData === undefined || attrData === null) return;
        var position = attrData - 0;
        var x = position % _this._gridNum;
        var y = parseInt(position / _this._gridNum, 10);
        controllerObj.goStep(x, y, true);
    }, false);
    _this.eventsBinded = true;
};

/**
 * 渲染棋盘
 */
DomRenderer.prototype.renderChessBoard = function() {
    var _this = this;

    _this._chessboardContainer.style.width = _this._chessBoardWidth + 'px';
    _this._chessboardContainer.style.height = _this._chessBoardWidth + 'px';
    _this._chessboardContainer.style.padding = _this._chessBoardPadding + 'px';
    _this._chessboardContainer.style.backgroundImage = 'url(./imgs/board.jpg)';
    _this._chessboardContainer.style.backgroundSize = 'cover';

    var fragment = '';
    for (var i = 0; i < _this._gridNum * _this._gridNum; i++) {
        fragment += '<div class="chess-grid" attr-data="' + i + '"></div>';
    }
    _this._chessboardContainer.innerHTML = fragment;
    _this._gridDoms = _this._chessboardContainer.getElementsByClassName('chess-grid');
    _this.chessBoardRendered = true;
};

/**
 * 渲染一步棋子
 * @param {Object} step 棋的位置
 */
DomRenderer.prototype.renderStep = function(step) {
    var _this = this;

    if (!step) return;

    var index = step.x + _this._gridNum * step.y;
    var domGrid = _this._gridDoms[index];
    domGrid.className = 'chess-grid ' + (step.role ? 'white-chess' : 'black-chess');
};

/**
 * 悔一步棋子
 * @param {Object} step 棋的位置
 * @param {Array} allSteps 剩下的所有棋的位置
 */
DomRenderer.prototype.renderUndo = function(step) {
    var _this = this;

    if (!step) return;
    var index = step.x + _this._gridNum * step.y;
    var domGrid = _this._gridDoms[index];
    domGrid.className = 'chess-grid';
};

/**
 * 清除所有棋子
 */
DomRenderer.prototype.renderClear = function() {
    var _this = this;

    for (var i = 0; i < _this._gridDoms.length; i++) {
        _this._gridDoms[i].className = 'chess-grid';
    }
};