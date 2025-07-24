import { GreenhouseConnector, LeverConnector, BullhornConnector, SalesforceConnector, HubspotConnector } from '../src/connectors';

describe('connector instantiation', () => {
  test('can create Greenhouse connector', () => {
    const connector = new GreenhouseConnector('test');
    expect(connector).toBeTruthy();
  });

  test('can create Lever connector', () => {
    const connector = new LeverConnector('test');
    expect(connector).toBeTruthy();
  });

  test('can create Bullhorn connector', () => {
    const connector = new BullhornConnector('id', 'secret', 'user', 'pass');
    expect(connector).toBeTruthy();
  });

  test('can create Salesforce connector', () => {
    const connector = new SalesforceConnector('http://example.com', 'token');
    expect(connector).toBeTruthy();
  });

  test('can create HubSpot connector', () => {
    const connector = new HubspotConnector('test');
    expect(connector).toBeTruthy();
  });
});
