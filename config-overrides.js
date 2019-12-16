// config-overrides.js

// noinspection ES6ConvertRequireIntoImport
const {useBabelRc, override} = require('customize-cra');
// noinspection ES6ConvertModuleExportToExport
module.exports = override(useBabelRc());