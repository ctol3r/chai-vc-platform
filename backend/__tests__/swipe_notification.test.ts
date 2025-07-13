import * as Notifier from '../src/verifier_notification_service';
import { handleSwipe } from '../src/controllers/swipe_controller';

test('handleSwipe triggers automatic verifier notification', () => {
  const spy = jest.spyOn(Notifier, 'notifyVerifier').mockImplementation(() => {});
  handleSwipe('user1', 'cred1', 'right');
  expect(spy).toHaveBeenCalledWith('user1', 'cred1', 'right');
});
