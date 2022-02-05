"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MongodbPubSub = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _graphqlSubscriptions = require("graphql-subscriptions");

var _messenger = require("./messenger");

var _messenger2 = _interopRequireDefault(_messenger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */


var defaultCommonMessageHandler = function defaultCommonMessageHandler(message) {
  return message;
};

var MongodbPubSub = exports.MongodbPubSub = function (_PubSub) {
  _inherits(MongodbPubSub, _PubSub);

  function MongodbPubSub() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, MongodbPubSub);

    var commonMessageHandler = options.commonMessageHandler;

    var _this = _possibleConstructorReturn(this, (MongodbPubSub.__proto__ || Object.getPrototypeOf(MongodbPubSub)).call(this));

    _this.ee = new _messenger2.default(options);
    _this.subscriptions = {};
    _this.subIdCounter = 0;
    _this.commonMessageHandler = commonMessageHandler || defaultCommonMessageHandler;
    _this.ee.connect();
    return _this;
  }

  _createClass(MongodbPubSub, [{
    key: "publish",
    value: async function publish(triggerName, payload) {
      this.ee.send(triggerName, payload);
      return Promise.resolve(true);
    }
  }, {
    key: "subscribe",
    value: async function subscribe(triggerName, onMessage) {
      var _this2 = this;

      var callback = function callback(message) {
        onMessage(message instanceof Error ? message : _this2.commonMessageHandler(message));
      };
      this.subIdCounter = this.subIdCounter + 1;
      this.subscriptions[this.subIdCounter] = [triggerName, callback];
      this.ee.subscribe(triggerName, true);
      this.ee.addListener(triggerName, callback);
      return Promise.resolve(this.subIdCounter);
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(subId) {
      if (this.subscriptions[subId]) {
        var _subscriptions$subId = _slicedToArray(this.subscriptions[subId], 2),
            triggerName = _subscriptions$subId[0],
            callback = _subscriptions$subId[1];

        delete this.subscriptions[subId];
        this.ee.removeListener(triggerName, callback);
        this.ee.subscribe(triggerName, false);
      }
    }
  }]);

  return MongodbPubSub;
}(_graphqlSubscriptions.PubSub);