const { StaffingDAOIntegration } = require('../blockchain/staffing_dao_integration');

const dao = new StaffingDAOIntegration();

async function createGig(gig) {
  return dao.postGig(gig);
}

async function listGigs() {
  return dao.fetchGigs();
}

async function takeGig(gigId) {
  return dao.acceptGig(gigId);
}

module.exports = { createGig, listGigs, takeGig };
