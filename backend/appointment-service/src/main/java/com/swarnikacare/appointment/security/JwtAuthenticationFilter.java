package com.swarnikacare.appointment.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Key;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @org.springframework.beans.factory.annotation.Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String secretKey;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();

            // Validate Issuer and Audience for defense in depth
            if (!"swarnika-iam".equals(claims.getIssuer()) || !"swarnika-care".equals(claims.getAudience())) {
                logger.warn("JWT failed issuer/audience validation");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Token");
                return;
            }

            String username = claims.getSubject();
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                List<String> roles = claims.get("roles", List.class);
                List<String> permissions = claims.get("permissions", List.class);
                
                List<GrantedAuthority> authorities = new ArrayList<>();
                if (roles != null) {
                    roles.forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role)));
                }
                if (permissions != null) {
                    permissions.forEach(perm -> authorities.add(new SimpleGrantedAuthority(perm)));
                }

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, authorities
                );
                
                Long hospitalId = null;
                Object hid = claims.get("hospitalId");
                if (hid instanceof Number) {
                    hospitalId = ((Number) hid).longValue();
                } else if (hid instanceof String) {
                    try {
                        hospitalId = Long.parseLong((String) hid);
                    } catch (NumberFormatException ignored) {}
                }
                if (hospitalId == null) {
                    String headerHid = request.getHeader("X-Hospital-Id");
                    if (headerHid != null && !headerHid.isBlank()) {
                        try {
                            hospitalId = Long.parseLong(headerHid.trim());
                        } catch (NumberFormatException ignored) {}
                    }
                }

                authToken.setDetails(new CustomAuthenticationDetails(request, hospitalId));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context: " + ex.getMessage());
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired JWT token");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
