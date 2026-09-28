package com.swarnikacare.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.security.Key;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @org.springframework.beans.factory.annotation.Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String secretKey;

    private final List<String> openApiEndpoints = List.of(
            "/api/v1/auth/request-otp",
            "/api/v1/auth/verify-otp",
            "/api/v1/auth/register/patient",
            "/api/v1/public/",
            "/swagger-ui",
            "/v3/api-docs",
            "/webjars",
            "/actuator"
    );

    @Override
    @SuppressWarnings("unchecked")
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // Skip CORS preflight OPTIONS requests
        if (request.getMethod() == org.springframework.http.HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        // Capture client-provided hospital context BEFORE stripping (used as fallback for multi-hospital staff)
        String clientHospitalId = request.getHeaders().getFirst("X-Hospital-Id");
        
        // Always strip potential spoofed headers from external requests
        ServerHttpRequest.Builder requestBuilder = request.mutate()
                .headers(headers -> {
                    headers.remove("X-User-Id");
                    headers.remove("X-Role");
                    headers.remove("X-Permissions");
                    headers.remove("X-Hospital-Id");
                });
        if (isSecured(request)) {
            if (!request.getHeaders().containsKey("Authorization")) {
                return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            final String authHeader = request.getHeaders().getOrEmpty("Authorization").get(0);
            if (!authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            final String token = authHeader.substring(7);

            try {
                Claims claims = extractAllClaims(token);
                
                // Validate Issuer and Audience
                if (!"swarnika-iam".equals(claims.getIssuer())) {
                    return onError(exchange, "Invalid Token Issuer", HttpStatus.UNAUTHORIZED);
                }
                if (!"swarnika-care".equals(claims.getAudience())) {
                    return onError(exchange, "Invalid Token Audience", HttpStatus.UNAUTHORIZED);
                }

                // Inject trusted headers downstream
                String userId = claims.getSubject();
                List<String> roles = claims.get("roles", List.class);
                List<String> permissions = claims.get("permissions", List.class);
                Object hospitalClaim = claims.get("hospitalId");
                if (hospitalClaim == null) {
                    hospitalClaim = claims.get("hospital_id");
                }

                requestBuilder
                        .header("X-User-Id", userId)
                        .header("X-Role", roles != null ? String.join(",", roles) : "")
                        .header("X-Permissions", permissions != null ? String.join(",", permissions) : "");

                if (hospitalClaim != null) {
                    // JWT-embedded hospitalId takes precedence (single-hospital staff / patients)
                    requestBuilder.header("X-Hospital-Id", hospitalClaim.toString());
                } else if (clientHospitalId != null && !clientHospitalId.isBlank()) {
                    // Multi-hospital staff (nurses, doctors, billing) send hospital context via header.
                    // Safe to forward since the user is already JWT-authenticated above.
                    requestBuilder.header("X-Hospital-Id", clientHospitalId);
                }

            } catch (Exception e) {
                log.error("JWT Validation failed: {}", e.getMessage());
                return onError(exchange, "Invalid JWT Token", HttpStatus.UNAUTHORIZED);
            }
        }
        
        return chain.filter(exchange.mutate().request(requestBuilder.build()).build());
    }

    private boolean isSecured(ServerHttpRequest request) {
        final String path = request.getPath().toString();
        if (path.equals("/")) {
            return false;
        }
        return openApiEndpoints.stream().noneMatch(path::startsWith);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    private Claims extractAllClaims(String token) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        Key key = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    @Override
    public int getOrder() {
        return -1; // Run early
    }
}
