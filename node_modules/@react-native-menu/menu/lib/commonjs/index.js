"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuView = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactNative = require("react-native");

var _UIMenuView = _interopRequireDefault(require("./UIMenuView"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function processAction(action) {
  var _action$subactions;

  return { ...action,
    imageColor: (0, _reactNative.processColor)(action.imageColor),
    titleColor: (0, _reactNative.processColor)(action.titleColor),
    subactions: (_action$subactions = action.subactions) === null || _action$subactions === void 0 ? void 0 : _action$subactions.map(subAction => processAction(subAction))
  };
}

const MenuView = ({
  actions,
  ...props
}) => {
  const processedActions = actions.map(action => processAction(action));
  return /*#__PURE__*/_react.default.createElement(_UIMenuView.default, _extends({}, props, {
    actions: processedActions
  }));
};

exports.MenuView = MenuView;
//# sourceMappingURL=index.js.map