import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class JwtGen {
    public static void main(String[] args) throws Exception {
        String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payload = "{\"sub\":\"1\",\"roles\":[\"ROLE_SUPER_ADMIN\"],\"iss\":\"swarnika-iam\",\"aud\":\"swarnika-care\",\"exp\":" + (System.currentTimeMillis() / 1000 + 3600) + "}";
        
        String b64Header = Base64.getUrlEncoder().withoutPadding().encodeToString(header.getBytes());
        String b64Payload = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes());
        
        String data = b64Header + "." + b64Payload;
        
        byte[] keyBytes = hexStringToByteArray("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(keyBytes, "HmacSHA256"));
        byte[] signatureBytes = mac.doFinal(data.getBytes());
        
        String b64Signature = Base64.getUrlEncoder().withoutPadding().encodeToString(signatureBytes);
        
        System.out.println(data + "." + b64Signature);
    }
    
    public static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                                 + Character.digit(s.charAt(i+1), 16));
        }
        return data;
    }
}
