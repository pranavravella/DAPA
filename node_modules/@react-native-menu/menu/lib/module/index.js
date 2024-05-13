function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import { processColor } from 'react-native';
import UIMenuView from './UIMenuView';

function processAction(action) {
  var _action$subactions;

  return { ...action,
    imageColor: processColor(action.imageColor),
    titleColor: processColor(action.titleColor),
    subactions: (_action$subactions = action.subactions) === null || _action$subactions === void 0 ? void 0 : _action$subactions.map(subAction => processAction(subAction))
  };
}

const MenuView = ({
  actions,
  ...props
}) => {
  const processedActions = actions.map(action => processAction(action));
  return /*#__PURE__*/React.createElement(UIMenuView, _extends({}, props, {
    actions: processedActions
  }));
};

export { MenuView };
//# sourceMappingURL=index.js.map