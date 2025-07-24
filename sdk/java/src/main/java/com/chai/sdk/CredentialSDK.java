package com.chai.sdk;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class CredentialSDK {
    public static class Credential {
        public final String payload;
        public final String signature;
        public Credential(String payload, String signature) {
            this.payload = payload;
            this.signature = signature;
        }
    }

    public static Credential issueCredential(String payload, String secret) throws Exception {
        String signature = sign(payload, secret);
        return new Credential(payload, signature);
    }

    public static boolean validateCredential(Credential credential, String secret) throws Exception {
        String expected = sign(credential.payload, secret);
        return expected.equals(credential.signature);
    }

    private static String sign(String message, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] raw = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(raw);
    }
}
