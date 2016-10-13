webpackJsonp([2],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _Shownotification = __webpack_require__(244);

	var _Shownotification2 = _interopRequireDefault(_Shownotification);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function enterApi(level, message, describe) {
	    (0, _Shownotification2["default"])(level, message, describe);
	}

	exports["default"] = enterApi;
	module.exports = exports['default'];

/***/ },

/***/ 244:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _css = __webpack_require__(89);

	var _notification = __webpack_require__(88);

	var _notification2 = _interopRequireDefault(_notification);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function openNotificationWithIcon(level, message, description) {
	  _notification2["default"]['warning']({
	    message: '无数据',
	    description: '找不到目标数据集',
	    duration: 2
	  });
	};

	exports["default"] = openNotificationWithIcon;
	module.exports = exports['default'];

/***/ }

});