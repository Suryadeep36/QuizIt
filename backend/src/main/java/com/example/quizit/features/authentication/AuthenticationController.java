package com.example.quizit.features.authentication;

import com.example.quizit.features.otpVerification.OtpRequestDto;
import com.example.quizit.features.otpVerification.OtpResponseDto;
import com.example.quizit.features.otpVerification.OtpVerification;
import com.example.quizit.features.otpVerification.OtpVerificationRepository;
import com.example.quizit.features.user.UserDto;
import com.example.quizit.features.user.User;
import com.example.quizit.records.LoginReuest;
import com.example.quizit.records.TokenResponse;
import com.example.quizit.features.user.UserRepository;
import com.example.quizit.security.*;
import com.example.quizit.services.interfaces.RegisterService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/quizit")
@AllArgsConstructor
public class AuthenticationController {


    private final AuthenticationManager authenticationManager;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final CookieService cookieService;
   private final RegisterService registerService;
   private final UserRepository userRepository;
   private final ModelMapper modelMapper;
    private final OtpVerificationRepository otpVerificationRepository;

    @PostMapping("/login")
   public ResponseEntity<TokenResponse> login(@RequestBody LoginReuest loginReuest, HttpServletResponse response)
   {
        Authentication authentication=  authenticate(loginReuest);
        User user = userRepository.findByEmail(loginReuest.email())
                .orElseThrow(()->new BadCredentialsException("Invalid email or password"));
        if(!user.isEnabled())
        {
            throw new DisabledException("User is disabled");
        }


        var refreshTokenOb = RefreshToken.builder()
                .jti(UUID.randomUUID().toString())
                .user(user)
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(jwtService.getRefreshTokenValiditySeconds()))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshTokenOb);

        String token = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user,refreshTokenOb.getJti());

        cookieService.attachRefreshCookie(response,refreshToken, (int) jwtService.getRefreshTokenValiditySeconds());
        cookieService.addNoStoreHeader(response);

        TokenResponse tokenResponse =
                TokenResponse.of(
                        token,
                        refreshToken,
                        jwtService.getAccessTokenValiditySeconds(),
                        modelMapper.map(user, UserDto.class)
                );
        return ResponseEntity.ok(tokenResponse);
   }

   private Authentication authenticate(LoginReuest loginReuest)
   {
       try {
          return authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginReuest.email(),loginReuest.password()));
       }
       catch (Exception e){
           throw new BadCredentialsException("Invalid username or password");
       }

   }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpRequestDto request) {

        OtpVerification otpEntity = otpVerificationRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (!otpEntity.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }
        if (otpEntity.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }


        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        boolean isStandardUser = user.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_USER"));

        if (isStandardUser) {
            // Automatically enable standard users (STUDENTS)
            user.setEnable(true);
        }

        userRepository.save(user);

        otpVerificationRepository.delete(otpEntity);

        return ResponseEntity.ok(
                new OtpResponseDto("Account verified successfully", true)
        );
    }

   @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@RequestBody UserDto userDto) {

      UserDto userdto1 =  registerService.registerUser(userDto);
      return ResponseEntity.ok(userdto1);
   }


    @PostMapping("/refresh")
    ResponseEntity<TokenResponse> refreshToken(
            @RequestBody(required = false) RefreshTokenRequest refreshTokenRequest,
            HttpServletRequest request,HttpServletResponse response)
    {
        try{
//            Thread.sleep(5000);
        }
        catch (Exception e){
            throw new BadCredentialsException("Invalid refresh token");
        }


        String refreshToken = getRefreshTokenFromRequest(refreshTokenRequest,request).orElseThrow(()->new BadCredentialsException("Refresh token is required"));
//        System.out.println("refreshToken:"+refreshToken);
        if(!jwtService.isRefreshToken(refreshToken))
        {
            throw new BadCredentialsException("Invalid refresh token");
        }

        String jti = jwtService.getJti(refreshToken);
        UUID userID = jwtService.getUserId(refreshToken);
        RefreshToken storedRefreshToken  = refreshTokenRepository.findByJti(jti).orElseThrow(()->new BadCredentialsException("Invalid refresh token"));

        if(storedRefreshToken.isRevoked()) {
            throw new BadCredentialsException("Refresh token is revoked");
        }

        if(storedRefreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BadCredentialsException("Refresh token is expired");
        }

        if(!storedRefreshToken.getUser().getId().equals(userID)) {
           throw new BadCredentialsException("Refresh token does not match user");
        }

        storedRefreshToken.setRevoked(true);

        String newJti = UUID.randomUUID().toString();;
        storedRefreshToken.setReplacedByToken(newJti);
        refreshTokenRepository.save(storedRefreshToken);

        User user =storedRefreshToken.getUser();

        var newRefreshTokenOb = RefreshToken.builder()
                .jti(newJti)
                .user(user)
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(jwtService.getRefreshTokenValiditySeconds()))
                .revoked(false)
                .build();

        refreshTokenRepository.save(newRefreshTokenOb);
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken  = jwtService.generateRefreshToken(user,newRefreshTokenOb.getJti());

        cookieService.attachRefreshCookie(response, newRefreshToken,(int)  jwtService.getRefreshTokenValiditySeconds());
        cookieService.addNoStoreHeader(response);
        return ResponseEntity.ok(TokenResponse.of(newAccessToken,newRefreshToken,jwtService.getAccessTokenValiditySeconds(),modelMapper.map(user, UserDto.class)));
    }

    private Optional<String> getRefreshTokenFromRequest(RefreshTokenRequest body, HttpServletRequest request) {

        if(request.getCookies()!=null) {
            Optional<String> refreshToken = Arrays.stream(request.getCookies())
                    .filter(c-> cookieService.getRefreshTokenCookieName().equals(c.getName()))
                    .map(Cookie::getValue)
                    .filter(v->!v.isBlank())
                    .findFirst();
            if(refreshToken.isPresent()) {
                return refreshToken;
            }
        }

        if(body!=null && body.getRefreshToken()!=null && !body.getRefreshToken().isBlank()) {
            return Optional.of(body.getRefreshToken());
        }

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if(authHeader != null && authHeader.regionMatches(true,0,"Bearer", 0, 7)) {
                String candidate = authHeader.substring(7).trim();
                if(!candidate.isEmpty()){
                    try {
                        if (jwtService.isRefreshToken(candidate)) {
                            return Optional.of(candidate);
                        }
                    }
                    catch (Exception ignored) {
                    }
                }

        }

        return Optional.empty();
    }

    @PostMapping("logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
       getRefreshTokenFromRequest(null,request).ifPresent(token -> {
           try
           {
                if(jwtService.isRefreshToken(token)) {
                    String jti  = jwtService.getJti(token);
                    refreshTokenRepository.findByJti(jti).ifPresent(rt -> {
                        rt.setRevoked(true);
                        refreshTokenRepository.save(rt);
                    });
                }
           }
           catch (JwtException ignored) {

           }
       });

      cookieService.clearRefreshCookie(response);
      cookieService.addNoStoreHeader(response);
      SecurityContextHolder.clearContext();
      return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
