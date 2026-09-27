import os
import glob

# 1. Update application.yml files
for yml_file in glob.glob('backend/*/src/main/resources/application.yml'):
    with open(yml_file, 'r') as f:
        content = f.read()
    if 'app:\n  security:\n    enabled: false' not in content and 'security:\n    enabled:' not in content:
        content = content + "\napp:\n  security:\n    enabled: false\n"
        with open(yml_file, 'w') as f:
            f.write(content)

# 2. Update backend JwtAuthenticationFilter
backend_jwt_pattern = '''        if (!securityEnabled) {
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
            authorities.add(new SimpleGrantedAuthority("ROLE_HOSPITAL_ADMIN"));
            authorities.add(new SimpleGrantedAuthority("ROLE_DOCTOR"));
            authorities.add(new SimpleGrantedAuthority("ROLE_PATIENT"));
            authorities.add(new SimpleGrantedAuthority("ROLE_RECEPTIONIST"));
            
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    "mock-admin", null, authorities
            );
            java.util.Map<String, Object> details = new java.util.HashMap<>();
            details.put("userId", "mock-admin");
            details.put("hospitalId", 1L);
            authToken.setDetails(details);
            SecurityContextHolder.getContext().setAuthentication(authToken);
            
            filterChain.doFilter(request, response);
            return;
        }'''

for j_file in glob.glob('backend/*/src/main/java/**/security/JwtAuthenticationFilter.java', recursive=True):
    with open(j_file, 'r') as f:
        content = f.read()
    
    if 'boolean securityEnabled' not in content:
        content = content.replace('public class JwtAuthenticationFilter extends OncePerRequestFilter {', 
'''public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @org.springframework.beans.factory.annotation.Value("${app.security.enabled:true}")
    private boolean securityEnabled;''')
        
        target = 'final String authHeader = request.getHeader("Authorization");'
        content = content.replace(target, backend_jwt_pattern + '\n\n        ' + target)
        
        with open(j_file, 'w') as f:
            f.write(content)
            print(f"Updated {j_file}")

# 3. Update API Gateway JwtAuthenticationFilter
gateway_file = 'backend/api-gateway/src/main/java/com/swarnikacare/gateway/filter/JwtAuthenticationFilter.java'
with open(gateway_file, 'r') as f:
    content = f.read()

if 'boolean securityEnabled' not in content:
    content = content.replace('public class JwtAuthenticationFilter implements GlobalFilter, Ordered {',
'''public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @org.springframework.beans.factory.annotation.Value("${app.security.enabled:true}")
    private boolean securityEnabled;''')
    
    gateway_pattern = '''        if (!securityEnabled) {
            ServerHttpRequest.Builder reqBuilder = request.mutate()
                    .header("X-User-Id", "mock-admin")
                    .header("X-Role", "SUPER_ADMIN,HOSPITAL_ADMIN,DOCTOR,PATIENT,RECEPTIONIST")
                    .header("X-Hospital-Id", "1");
            return chain.filter(exchange.mutate().request(reqBuilder.build()).build());
        }'''
        
    target = 'if (isSecured(request)) {'
    content = content.replace(target, gateway_pattern + '\n\n        ' + target)
    
    with open(gateway_file, 'w') as f:
        f.write(content)
        print(f"Updated {gateway_file}")

