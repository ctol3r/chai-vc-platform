const { StaffingDAOIntegration } = require('../src/blockchain/staffing_dao_integration.js');

(async () => {
  const dao = new StaffingDAOIntegration();
  const gigs = await dao.fetchGigs();
  if (!Array.isArray(gigs)) throw new Error('fetchGigs should return an array');
  const tx = await dao.postGig({ id: '2', description: 'Test gig', reward: '5 USDC' });
  if (typeof tx !== 'string') throw new Error('postGig should return a tx id');
  const accepted = await dao.acceptGig('2');
  if (accepted !== true) throw new Error('acceptGig should return true');
})();
