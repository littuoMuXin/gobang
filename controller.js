var steps = [];
var renderer;
var c = {
  renderer(value) {
    if (arguments.length > 0) {
      renderer = value;
      this.init();
    }
    return renderer;
  },
  init(clearSteps) {
    // ToDo: 先做一些清理工作，和一些全局的界面渲染。

    if (clearSteps) steps = [];
    if (!renderer) return;
    renderer.renderChessboard();
    steps.forEach(function (step) {
      renderer.renderStep(step);
    });
  },
  isBlack() {
    return !steps.length || steps[steps.length - 1].isBlack;
  },
  chess(x, y, isBlack) { // 落子时调此方法，其中第3个参数选填。
    if (isBlack != null && this.isBlack() === isBlack) return;
    var step = { x: x, y: y, isBlack: !this.isBlack() };
    steps.push(step);
    if (renderer) renderer.renderStep(step);
  },
  undo() {
    var step = steps.pop();
    if (!step || !renderer) return;
    if (renderer.renderUndo) renderer.renderUndo(step);
    else this.init();
  }
};

exports = c;
