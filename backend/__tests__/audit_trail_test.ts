import fs from 'fs';
import path from 'path';
import { recordProfileView, recordDownload, recordHire, getAuditTrail } from '../src/audit/audit_trail';

describe('audit trail', () => {
  const logFile = path.join(__dirname, '../src/audit/audit_log.json');

  beforeEach(() => {
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }
  });

  it('records profile views, downloads, and hires', () => {
    recordProfileView('user1', 'profileA');
    recordDownload('user1', 'profileA');
    recordHire('user1', 'profileA');
    const events = getAuditTrail();
    expect(events.length).toBe(3);
    expect(events[0].type).toBe('PROFILE_VIEW');
    expect(events[1].type).toBe('DOWNLOAD');
    expect(events[2].type).toBe('HIRE');
  });
});
