package com.example.quizit.services;

import com.example.quizit.dtos.UserDto;
import com.example.quizit.entities.User;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.helpers.UserHelper;
import com.example.quizit.repositories.UserRepository;
import com.example.quizit.services.interfaces.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;

import org.springframework.data.annotation.ReadOnlyProperty;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

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
        user.setProvider(userDto.getProvider()!=null?userDto.getProvider():null);

        User savedUser = userRepository.save(user);

        return modelMapper.map(savedUser, UserDto.class);
    }

    @Override
    public UserDto updateUser(UserDto userDto) {
        return null;
    }

    @Override
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByemail(email).orElseThrow(()->new ResourceNotFoundException("User not found with given email id!"));

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

        if(userDto.getPassword()!=null) existingUser.setPassword(userDto.getPassword());

        User user = userRepository.save(existingUser);
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    public void deleteUser(String uuid) {

        User user = userRepository.findById(UserHelper.parseUUID(uuid)).orElseThrow(()->new ResourceNotFoundException("User not found"));
        userRepository.delete(user);

    }
}
