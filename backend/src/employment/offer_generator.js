/**
 * Utility to generate an employment offer agreement with optional escrow deposit.
 * Returns a JSON representation of the agreement.
 */
function generateEmploymentOffer({ employeeName, employerName, role, salary, depositEther }) {
  const date = new Date().toISOString().split('T')[0];
  return {
    employeeName,
    employerName,
    role,
    salary,
    depositEther,
    date,
    agreement: `This offer is made to ${employeeName} for the role of ${role} at ${employerName}. Salary is ${salary}.`
  };
}
module.exports = { generateEmploymentOffer };
