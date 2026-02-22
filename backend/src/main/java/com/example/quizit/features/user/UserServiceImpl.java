package com.example.quizit.features.user;

import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.features.emailService.EmailService;
import com.example.quizit.features.otpVerification.OtpVerification;
import com.example.quizit.features.otpVerification.OtpVerificationRepository;
import com.example.quizit.features.role.Role;
import com.example.quizit.features.role.RoleRepository;
import com.example.quizit.helpers.UserHelper;
import com.example.quizit.security.AppConstraint;
import com.example.quizit.services.interfaces.UserService;
import com.sun.security.auth.NTUserPrincipal;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;

import org.springframework.data.annotation.ReadOnlyProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final EmailService emailService;
    @Transactional
    @Override
    public UserDto createUser(UserDto userDto) {


        if(userDto.getEmail()== null || userDto.getEmail().isBlank() ){
            throw new IllegalArgumentException("Email is required");
        }

        if (userDto.getUsername()== null || userDto.getUsername().isBlank() ){
            throw new IllegalArgumentException("Username is required");
        }

        if (userRepository.existsByemail(userDto.getEmail())) {
            throw new IllegalArgumentException("Email Already Exists");
        }


        User user = modelMapper.map(userDto, User.class);
        user.setProvider(userDto.getProvider()!=null?userDto.getProvider():Provider.LOCAL);
        if(user.getProvider() == Provider.LOCAL)
        {
            user.setEnable(false);
        }
        Set<Role> roleEntities = new HashSet<>();
        Role defaultRole = roleRepository.findByName("ROLE_" + AppConstraint.USER_ROLE)
                .orElseThrow(() -> new RuntimeException("USER role is not found"));
        roleEntities.add(defaultRole);
        user.setRoles(roleEntities);

        User savedUser = userRepository.save(user);


        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        OtpVerification otpEntity = new OtpVerification();
        otpEntity.setEmail(userDto.getEmail());
        otpEntity.setOtp(otp);
        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        otpVerificationRepository.save(otpEntity);
        emailService.sendOtp(otpEntity.getEmail(), otp);

        return modelMapper.map(savedUser, UserDto.class);
    }

    @Override
    public UserDto updateUser(UserDto userDto) {
        return null;
    }

    @Override
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(()->new ResourceNotFoundException("User not found with given email id!"));

        return modelMapper.map(user, UserDto.class);
    }


    @Override
    public UserDto getUserById(String uuid) {

        UUID id = UserHelper.parseUUID(uuid);
        User user =  userRepository.findById(id).orElseThrow(()-> new  ResourceNotFoundException("User not found with given uuid!"));
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    @ReadOnlyProperty
    @Transactional
    public Iterable<UserDto> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(user->modelMapper.map(user,UserDto.class))
                .toList();

    }

    @Override
    public UserDto updateUser(UserDto userDto, String uuid) {
        if (userDto == null) {
            throw new ResourceNotFoundException();
        }
        UUID id =  UserHelper.parseUUID(uuid);
        User existingUser  = userRepository.findById(id).orElseThrow(()-> new  ResourceNotFoundException("User not found!"));

        if(userDto.getUsername()!=null) existingUser.setUsername(userDto.getUsername());
        if(userDto.getImage()!=null) existingUser.setImage(userDto.getImage());
        if (userDto.getProvider()!=null) existingUser.setProvider(userDto.getProvider());

//        TODO: change password update logic

        if(userDto.getPassword() != null && !userDto.getPassword().isBlank()) existingUser.setPassword(passwordEncoder.encode(userDto.getPassword()));

        User user = userRepository.save(existingUser);
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    public void deleteUser(String uuid) {

        User user = userRepository.findById(UserHelper.parseUUID(uuid)).orElseThrow(()->new ResourceNotFoundException("User not found"));
        userRepository.delete(user);

    }
}
