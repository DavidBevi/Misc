"use strict";
(self["webpackChunknova_web"] = self["webpackChunknova_web"] || []).push([[673],{

/***/ "./src/vector/app.tsx":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  loadApp: () => (/* binding */ loadApp)
});

// EXTERNAL MODULE: ../../node_modules/react/index.js
var react = __webpack_require__("../../node_modules/react/index.js");
// EXTERNAL MODULE: ../matrix-react-sdk/src/PlatformPeg.ts
var PlatformPeg = __webpack_require__("../matrix-react-sdk/src/PlatformPeg.ts");
// EXTERNAL MODULE: ../matrix-react-sdk/src/languageHandler.tsx + 1 modules
var languageHandler = __webpack_require__("../matrix-react-sdk/src/languageHandler.tsx");
// EXTERNAL MODULE: ../matrix-react-sdk/src/utils/AutoDiscoveryUtils.tsx + 1 modules
var AutoDiscoveryUtils = __webpack_require__("../matrix-react-sdk/src/utils/AutoDiscoveryUtils.tsx");
// EXTERNAL MODULE: ../matrix-js-sdk/src/autodiscovery.ts
var autodiscovery = __webpack_require__("../matrix-js-sdk/src/autodiscovery.ts");
// EXTERNAL MODULE: ../matrix-react-sdk/src/Lifecycle.ts + 1 modules
var Lifecycle = __webpack_require__("../matrix-react-sdk/src/Lifecycle.ts");
// EXTERNAL MODULE: ../matrix-react-sdk/src/SdkConfig.ts
var SdkConfig = __webpack_require__("../matrix-react-sdk/src/SdkConfig.ts");
// EXTERNAL MODULE: ../matrix-js-sdk/src/logger.ts
var logger = __webpack_require__("../matrix-js-sdk/src/logger.ts");
// EXTERNAL MODULE: ../matrix-react-sdk/src/BeeperServices.ts
var BeeperServices = __webpack_require__("../matrix-react-sdk/src/BeeperServices.ts");
// EXTERNAL MODULE: ../matrix-react-sdk/src/Modal.tsx + 1 modules
var Modal = __webpack_require__("../matrix-react-sdk/src/Modal.tsx");
// EXTERNAL MODULE: ../matrix-react-sdk/src/components/views/dialogs/BaseDialog.tsx
var BaseDialog = __webpack_require__("../matrix-react-sdk/src/components/views/dialogs/BaseDialog.tsx");
// EXTERNAL MODULE: ../matrix-react-sdk/src/components/views/elements/DialogButtons.tsx
var DialogButtons = __webpack_require__("../matrix-react-sdk/src/components/views/elements/DialogButtons.tsx");
// EXTERNAL MODULE: ../bridge-kit/src/assert.ts
var assert = __webpack_require__("../bridge-kit/src/assert.ts");
// EXTERNAL MODULE: ../matrix-react-sdk/src/rageshake/submit-rageshake.ts
var submit_rageshake = __webpack_require__("../matrix-react-sdk/src/rageshake/submit-rageshake.ts");
// EXTERNAL MODULE: ../../node_modules/dayjs/dayjs.min.js
var dayjs_min = __webpack_require__("../../node_modules/dayjs/dayjs.min.js");
var dayjs_min_default = /*#__PURE__*/__webpack_require__.n(dayjs_min);
;// CONCATENATED MODULE: ./src/vector/BeeperDebug.tsx






// import * as Sentry from "@sentry/electron";



let assertionsEnabled = true;
async function init() {
  const name = await mxPlatformPeg.get().getAppName();
  const version = await mxPlatformPeg.get().getAppVersion();
  assertionsEnabled = (name === null || name === void 0 ? void 0 : name.toLowerCase().includes('beta')) || (version === null || version === void 0 ? void 0 : version.endsWith('.0'));
}
init();
function WarningErrorDialog({
  onFinished,
  message
}) {
  const onCancel = () => {
    onFinished();
  };
  const onSignOut = async () => {
    try {
      await Lifecycle/* logout */.kS();
    } finally {
      mxPlatformPeg.get().reload();
    }
  };
  return /*#__PURE__*/react.createElement(BaseDialog/* default */.Z, {
    className: "mx_ErrorDialog",
    onFinished: onFinished,
    title: "Warning",
    contentId: "mx_Dialog_content",
    hasCancel: false
  }, /*#__PURE__*/react.createElement("div", {
    className: "mx_Dialog_content",
    id: "mx_Dialog_content"
  }, /*#__PURE__*/react.createElement("p", null, "Beeper encounerted an unexpected error."), /*#__PURE__*/react.createElement("pre", null, message), /*#__PURE__*/react.createElement("p", null, "If the problem persists use the link below to sign out")), /*#__PURE__*/react.createElement(DialogButtons/* default */.Z, {
    primaryButton: "Sign out",
    onCancel: onCancel,
    onPrimaryButtonClick: onSignOut,
    focus: true,
    hasCancel: true
  }));
}
function FatalErrorDialog({
  onFinished,
  message
}) {
  const onSignOutClick = async () => {
    try {
      await Lifecycle/* logout */.kS();
    } finally {
      mxPlatformPeg.get().reload();
    }
  };
  return /*#__PURE__*/react.createElement(BaseDialog/* default */.Z, {
    className: "mx_ErrorDialog",
    onFinished: onFinished,
    title: "Fatal Error",
    contentId: "mx_Dialog_content",
    hasCancel: false
  }, /*#__PURE__*/react.createElement("div", {
    className: "mx_Dialog_content",
    id: "mx_Dialog_content"
  }, /*#__PURE__*/react.createElement("p", null, "Unfortunately Beeper has encountered an error. Please use the link below to submit a bug report and then sign out.")), /*#__PURE__*/react.createElement(DialogButtons/* default */.Z, {
    primaryButton: "Sign out",
    onPrimaryButtonClick: onSignOutClick,
    focus: true,
    hasCancel: false
  }));
}
window.bpAssert = function (condition, ...args) {
  if (!condition) {
    let error = new assert/* AssertionError */.p('AssertionFailure: ' + args.join(' '));
    console.error(error);
    if (!assertionsEnabled) {
      // Sentry.captureException(error);
      console.warn('assertion failure submitted to sentry', error);
      return;
    }
    bpFatalError(error);
  }
};
window.bpSoftAssert = function (condition, ...args) {
  if (!condition) {
    let error = new assert/* AssertionError */.p('AssertionFailure: ' + args.join(' '));
    console.warn(error);
    if (!assertionsEnabled) {
      // Sentry.captureException(error);
      console.warn('soft assertion failure submitted to sentry', error);
      return;
    }
    bpWarning(error);
  }
};
function automaticRageshake(error) {
  const rageshakeUrl = `${BeeperServices/* BeeperServices */.z.get().rageshakeUrl}/api/submit`;
  (0,submit_rageshake/* default */.ZP)(rageshakeUrl, {
    sendLogs: true,
    timestamp: dayjs_min_default()().format().slice(0, 16),
    problem: 'Assertion Failure',
    label: error === null || error === void 0 ? void 0 : error.message,
    userText: error === null || error === void 0 ? void 0 : error.stack
  });
}
window.bpWarning = function (error) {
  // Throw a debugger statement in case a developer has devtools open
  debugger;
  if (true) {
    setImmediate(() => {
      automaticRageshake(error);
    });
  }
  setImmediate(() => {
    Modal/* default */.ZP.createTrackedDialog('Warning Dialog', '', WarningErrorDialog, {
      title: 'Warning',
      message: (error === null || error === void 0 ? void 0 : error.stack) || '' + error
    });
  });
};
window.bpFatalError = function (error) {
  // Throw a debugger statement in case a developer has their devtools open
  debugger;
  setImmediate(() => {
    automaticRageshake(error);
  });
  setImmediate(() => {
    Modal/* default */.ZP.createTrackedDialog('Fatal Error Dialog', '', FatalErrorDialog, {
      title: 'Fatal Error',
      message: (error === null || error === void 0 ? void 0 : error.stack) || '' + error
    });
  });
  throw error;
};
// EXTERNAL MODULE: ../matrix-react-sdk/src/components/structures/MatrixChat.tsx + 19 modules
var MatrixChat = __webpack_require__("../matrix-react-sdk/src/components/structures/MatrixChat.tsx");
;// CONCATENATED MODULE: ./src/vector/app.tsx
/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2018, 2019 New Vector Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2020 The Matrix.org Foundation C.I.C.
Copyright 2020 Dmitry Tyvaniuk <dm0141e@gmail.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/













// add React and ReactPerf to the global namespace, to make them easier to access via the console
// this incidentally means we can forget our React imports in JSX files without penalty.
window.React = react;
logger/* logger */.k.log(`Application is running in ${"production"} mode`);
window.matrixLogger = logger/* logger */.k;
async function loadApp() {
  const platform = PlatformPeg/* default */.Z.get();
  platform.startUpdater();

  // Don't bother loading the app until the config is verified
  const config = await verifyServerConfig();
  return /*#__PURE__*/react.createElement(MatrixChat/* default */.ZP, {
    config: config,
    enableGuest: !config.disable_guests,
    defaultDeviceDisplayName: platform.getDefaultDeviceDisplayName()
  });
}
async function verifyServerConfig() {
  let validatedConfig;
  try {
    logger/* logger */.k.log('Verifying homeserver configuration');

    // Note: the query string may include is_url and hs_url - we only respect these in the
    // context of email validation. Because we don't respect them otherwise, we do not need
    // to parse or consider them here.

    // Note: Although we throw all 3 possible configuration options through a .well-known-style
    // verification, we do not care if the servers are online at this point. We do moderately
    // care if they are syntactically correct though, so we shove them through the .well-known
    // validators for that purpose.

    const config = SdkConfig/* default */.ZP.get();

    // Fetch the manifest for BeeperServices and override config.json with the values
    await BeeperServices/* BeeperServices */.z.get().fetchPromise;
    config.default_server_config['m.homeserver'] = {
      base_url: BeeperServices/* BeeperServices */.z.get().matrixUrl,
      server_name: BeeperServices/* BeeperServices */.z.get().matrixServerName
    };
    let wkConfig = config['default_server_config']; // overwritten later under some conditions
    const serverName = config['default_server_name'];
    const hsUrl = config['default_hs_url'];
    const isUrl = config['default_is_url'];
    const incompatibleOptions = [wkConfig, serverName, hsUrl].filter(i => !!i);
    if (incompatibleOptions.length > 1) {
      // noinspection ExceptionCaughtLocallyJS
      throw (0,languageHandler/* newTranslatableError */.ys)((0,languageHandler/* _td */.I8)('Invalid configuration: can only specify one of default_server_config, default_server_name, ' + 'or default_hs_url.'));
    }
    if (incompatibleOptions.length < 1) {
      // noinspection ExceptionCaughtLocallyJS
      throw (0,languageHandler/* newTranslatableError */.ys)((0,languageHandler/* _td */.I8)('Invalid configuration: no default server specified.'));
    }
    if (hsUrl) {
      logger/* logger */.k.log('Config uses a default_hs_url - constructing a default_server_config using this information');
      logger/* logger */.k.warn('DEPRECATED CONFIG OPTION: In the future, default_hs_url will not be accepted. Please use ' + 'default_server_config instead.');
      wkConfig = {
        'm.homeserver': {
          base_url: hsUrl
        }
      };
      if (isUrl) {
        wkConfig['m.identity_server'] = {
          base_url: isUrl
        };
      }
    }
    let discoveryResult = null;
    if (wkConfig) {
      logger/* logger */.k.log('Config uses a default_server_config - validating object');
      discoveryResult = await autodiscovery/* AutoDiscovery */.m.fromDiscoveryConfig(wkConfig);
    }
    if (serverName) {
      logger/* logger */.k.log('Config uses a default_server_name - doing .well-known lookup');
      logger/* logger */.k.warn('DEPRECATED CONFIG OPTION: In the future, default_server_name will not be accepted. Please ' + 'use default_server_config instead.');
      discoveryResult = await autodiscovery/* AutoDiscovery */.m.findClientConfig(serverName);
    }
    validatedConfig = AutoDiscoveryUtils/* default */.Z.buildValidatedConfigFromDiscovery(serverName, discoveryResult, true);
  } catch (e) {
    const {
      hsUrl,
      isUrl,
      userId
    } = await Lifecycle/* getStoredSessionVars */.dI();
    if (hsUrl && userId) {
      logger/* logger */.k.error(e);
      logger/* logger */.k.warn("A session was found - suppressing config error and using the session's homeserver");
      logger/* logger */.k.log('Using pre-existing hsUrl and isUrl: ', {
        hsUrl,
        isUrl
      });
      validatedConfig = await AutoDiscoveryUtils/* default */.Z.validateServerConfigWithStaticUrls(hsUrl, isUrl, true);
    } else {
      // the user is not logged in, so scream
      throw e;
    }
  }
  validatedConfig.isDefault = true;

  // Just in case we ever have to debug this
  logger/* logger */.k.log('Using homeserver config:', validatedConfig);

  // Add the newly built config to the actual config for use by the app
  logger/* logger */.k.log('Updating SdkConfig with validated discovery information');
  SdkConfig/* default */.ZP.add({
    validated_server_config: validatedConfig
  });
  return SdkConfig/* default */.ZP.get();
}

/***/ })

}]);
//# sourceMappingURL=element-web-app.js.map