package com.example.quizit.features.user;

import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.features.emailService.EmailService;
import com.example.quizit.features.otpVerification.OtpVerification;
import com.example.quizit.features.otpVerification.OtpVerificationRepository;
import com.example.quizit.features.role.Role;
import com.example.quizit.features.role.RoleRepository;
import com.example.quizit.helpers.UserHelper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;

import org.springframework.data.annotation.ReadOnlyProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final EmailService emailService;
    private final RegistrationApprovalService registrationApprovalService;
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
        // 3. Dynamic Role Assignment
        Set<Role> roleEntities = new HashSet<>();
        boolean isTeacherRequest = false;

        if (userDto.getRoles() != null && !userDto.getRoles().isEmpty()) {
            for (String roleName : userDto.getRoles()) {
                if ("TEACHER".equalsIgnoreCase(roleName)){
                    isTeacherRequest = true;
                    user.setStatus(UserStatus.TEACHER_PENDING);
                };

                Role role = roleRepository.findByName("ROLE_" + roleName.toUpperCase())
                        .orElseThrow(() -> new RuntimeException("Role " + roleName + " not found"));
                roleEntities.add(role);
            }
        } else {
            Role defaultRole = roleRepository.findByName("ROLE_USER").get();
            roleEntities.add(defaultRole);
        }

        user.setRoles(roleEntities);
        User savedUser = userRepository.save(user);

        // --- TRIGGER ADMIN PERMISSION LOGIC ---
        if (isTeacherRequest) {
            registrationApprovalService.notifyAdminsForTeacherSignup(userDto);
        }


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

    @Override
    public List<UserDto> getUsersByRoleAndStatus(String roleName, UserStatus status) {
        return userRepository.findAllByRoleNameAndStatus("ROLE_" + roleName.toUpperCase(), status)
                .stream()
                .map(user -> {
                    UserDto dto = new UserDto();
                    dto.setId(user.getId());
                    dto.setUsername(user.getUsername());
                    dto.setEmail(user.getEmail());
                    // Set roles as strings to match your UserDto structure
                    dto.setCreatedAt(user.getCreatedAt());
                    dto.setStatus(status);
                    dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
                    return dto;
                })
                .toList();
    }

    @Transactional
    @Override
    public void updateTeacherStatusByEmail(String email, ApprovalDecisionDto decision) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with email " + email + " not found"));

        if (decision.isApproved()) {
            user.setStatus(UserStatus.TEACHER_APPROVED);
            user.setEnable(true);
            userRepository.save(user);
            // Notify Teacher of success
            emailService.sendRegisterMail(user.getEmail(),
                    "QuizIt: Account Approved!",
                    "<h3>Congratulations!</h3><p>Your teacher account is now active.</p>");
        } else {
            user.setStatus(UserStatus.TEACHER_REJECTED);
            user.setEnable(false);

            // Notify Teacher of rejection
            emailService.sendRegisterMail(user.getEmail(),
                    "QuizIt: Account Update",
                    "<p>Your request for teacher access was declined." + decision.getReason() + "</p>");

            userRepository.delete(user);
            // Optional: delete user if you don't want to keep rejected records
            // userRepository.delete(user);
        }


    }
    @Transactional
    @Override
    public void revokeRoleAndUpdateStatus(String email, String roleName,UserStatus status) {
        // 1. Find User
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // 2. Find the Role entity to remove
        String formattedRole = "ROLE_" + roleName.toUpperCase();
        Role roleToRemove = roleRepository.findByName(formattedRole)
                .orElseThrow(() -> new RuntimeException("Role not found: " + formattedRole));

        // 3. Remove Role and Update Status
        if (user.getRoles().contains(roleToRemove)) {
            user.getRoles().remove(roleToRemove);

            // If they have no special roles left, set them back to a standard status
            // You can use a specific status like TEACHER_REJECTED or just a generic PENDING
            user.setStatus(status);

            // Optional: If you want to block login entirely until re-approval
            // user.setEnable(false);

            userRepository.save(user);
        } else {
            throw new RuntimeException("User does not have the role: " + roleName);
        }
    }


}
