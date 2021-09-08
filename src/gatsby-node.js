require('core-js/stable');
require('regenerator-runtime/runtime');
const { ERROR_MAP } = require('./errorMap');

const createSchemaCustomization = require('./hooks/createSchemaCustomization');
exports.createSchemaCustomization = createSchemaCustomization;

const sourceNodes = require('./hooks/sourceNodes');
exports.sourceNodes = sourceNodes;

let onPluginInitSupported = false;

try {
  const { isGatsbyNodeLifecycleSupported } = require(`gatsby-plugin-utils`);

  if (isGatsbyNodeLifecycleSupported(`onPluginInit`)) {
    onPluginInitSupported = 'stable';
  } else if (isGatsbyNodeLifecycleSupported(`unstable_onPluginInit`)) {
    onPluginInitSupported = 'unstable';
  }
} catch (e) {
  console.error(`Could not check if Gatsby supports onPluginInit lifecycle`);
}

const onPluginInit = async ({ reporter }) => {
  reporter.setErrorMap(ERROR_MAP);
};

if (onPluginInitSupported === 'stable') {
  // to properly initialize plugin in worker (`onPreBootstrap` won't run in workers)
  // need to conditionally export otherwise it throw an error for older versions
  exports.onPluginInit = onPluginInit;
} else if (onPluginInitSupported === 'unstable') {
  exports.unstable_onPluginInit = onPluginInit;
}

exports.onPreInit = async ({ reporter }, {}) => {
  // onPluginInit replaces onPreInit in Gatsby V4
  // old versions of Gatsby does not have the method setErrorMap
  if (!onPluginInitSupported && reporter.setErrorMap) {
    reporter.setErrorMap(ERROR_MAP);
  }
};
