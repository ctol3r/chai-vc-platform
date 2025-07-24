import { GigContract, GigScheduler } from './gig_contracts';

// Simple payment processor that just logs a message
function processPayment(gig: GigContract) {
  console.log(`Payment of ${gig.paymentAmount} released for gig ${gig.id}`);
}

const scheduler = new GigScheduler(processPayment);

// Example gig that ends 3 seconds from now
const gig: GigContract = {
  id: 'gig1',
  workerId: 'worker123',
  employerId: 'employer456',
  startDate: new Date(),
  endDate: new Date(Date.now() + 3000),
  paymentAmount: 100,
};

console.log('Scheduling gig:', gig);
scheduler.scheduleGig(gig);
