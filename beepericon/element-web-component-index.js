"use strict";
(self["webpackChunknova_web"] = self["webpackChunknova_web"] || []).push([[802],{

/***/ "./src/component-index.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  components: () => (/* binding */ components)
});

// EXTERNAL MODULE: ../../node_modules/@babel/runtime/helpers/esm/defineProperty.js + 3 modules
var defineProperty = __webpack_require__("../../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
// EXTERNAL MODULE: ../matrix-react-sdk/src/components/structures/EmbeddedPage.tsx
var EmbeddedPage = __webpack_require__("../matrix-react-sdk/src/components/structures/EmbeddedPage.tsx");
// EXTERNAL MODULE: ../../node_modules/sanitize-html/index.js
var sanitize_html = __webpack_require__("../../node_modules/sanitize-html/index.js");
var sanitize_html_default = /*#__PURE__*/__webpack_require__.n(sanitize_html);
// EXTERNAL MODULE: ../matrix-react-sdk/src/languageHandler.tsx + 1 modules
var languageHandler = __webpack_require__("../matrix-react-sdk/src/languageHandler.tsx");
;// CONCATENATED MODULE: ./src/components/structures/VectorEmbeddedPage.tsx

/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2019 New Vector Ltd

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




class VectorEmbeddedPage extends EmbeddedPage/* default */.Z {
  // we're overriding the base component here, for Element-specific tweaks
  translate(s) {
    s = sanitize_html_default()((0,languageHandler._t)(s));
    // ugly fix for https://github.com/vector-im/element-web/issues/4243
    // eslint-disable-next-line max-len
    s = s.replace(/\[matrix\]/, '<a href="https://matrix.org" target="_blank" rel="noreferrer noopener"><img width="79" height="34" alt="Matrix" style="padding-left: 1px;vertical-align: middle" src="welcome/images/matrix.svg"/></a>');
    return s;
  }
}
(0,defineProperty/* default */.Z)(VectorEmbeddedPage, "replaces", 'EmbeddedPage');
;// CONCATENATED MODULE: ./src/component-index.js
/*
Copyright 2018 New Vector Ltd

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

/*
 * THIS FILE IS AUTO-GENERATED
 * You can edit it you like, but your changes will be overwritten,
 * so you'd just be trying to swim upstream like a salmon.
 * You are not a salmon.
 */

let components = {};

VectorEmbeddedPage && (components['structures.VectorEmbeddedPage'] = VectorEmbeddedPage);


/***/ })

}]);
//# sourceMappingURL=element-web-component-index.js.map