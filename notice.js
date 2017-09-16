/**
 * 消息通知对象
 */

var notice = {};
notice.container = document.getElementById('msg');
/**
 * 展示通知消息
 * @param {String} msg 消息文本
 * @param {Number} duration 消息显示的时长
 */
notice.showMsg = function(msg, duration) {
    var _this = this;
    _this.container.innerHTML = msg;
    _this.container.className = 'msg-container show';
    setTimeout(function() {
        if (_this.container.className.indexOf('show') >= 0) {
            _this.container.className = 'msg-container';
        }
    }, duration || 0);
};