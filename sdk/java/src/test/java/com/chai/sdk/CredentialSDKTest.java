package com.chai.sdk;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CredentialSDKTest {
    @Test
    public void testIssueAndValidate() throws Exception {
        String payload = "{\"id\":1}";
        String secret = "topsecret";
        CredentialSDK.Credential cred = CredentialSDK.issueCredential(payload, secret);
        assertTrue(CredentialSDK.validateCredential(cred, secret));
        CredentialSDK.Credential bad = new CredentialSDK.Credential(payload, "bad");
        assertFalse(CredentialSDK.validateCredential(bad, secret));
    }
}
