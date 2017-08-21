/**
 * 负责 DOM 版本的五子棋的渲染工作
 */

function DomRenderer(container) {
    this._gridNum = 15; // 棋盘行列数
    this._gridDoms = []; // 存放棋盘 DOM
    this._chessboardContainer = container; // 容器
    this.chessBoardRendered = false; // 是否渲染了棋盘
    this.eventsBinded = false; // 是否绑定了事件
}

/**
 * 绑定事件
 * @param controllerObj 控制器对象
 */
DomRenderer.prototype.bindEvents = function(controllerObj) {
    var _this = this;

    _this._chessboardContainer.addEventListener('click', function(ev) {
        var target = ev.target;
        var position = target.getAttribute('attr-data') - 0;
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
 * @param step 棋的位置
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
 * @param step     棋的位置
 * @param allSteps 剩下的所有棋的位置
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