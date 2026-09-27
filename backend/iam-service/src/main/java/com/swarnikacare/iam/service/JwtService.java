package com.swarnikacare.iam.service;

import com.swarnikacare.iam.entity.User;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String generateToken(User user);
    String extractUsername(String token);
    <T> T extractClaim(String token, java.util.function.Function<io.jsonwebtoken.Claims, T> claimsResolver);
    boolean isTokenValid(String token, UserDetails userDetails);
}
