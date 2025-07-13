const { sendClinicianToHRIS } = require('../hris/hris_webhook');

/**
 * Hire a clinician and push their details to the hospital HRIS.
 * @param {{id: string, name: string, role: string}} clinician
 */
async function hireClinician(clinician) {
  // Placeholder for additional business logic such as credential checks.
  await sendClinicianToHRIS(clinician);
}

module.exports = { hireClinician };
