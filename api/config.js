/*
 * Create and export configuration variables
 *
 */

// Container for all environments
const environments = {};

// Local (default) environment
environments.local = {
  'port' : 4000,
  'httpsPort' : 4001,
  'envName' : 'local'
};

// Production environment
environments.production = {
  'port' : 5000,
  'httpsPort' : 5001,
  'envName' : 'production'
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.ENVIRONMENT) == 'string' ? process.env.ENVIRONMENT.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to local
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.local;

// Export the module
module.exports = environmentToExport;
