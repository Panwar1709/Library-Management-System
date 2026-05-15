package com.library.service;

import com.library.dto.UserDTO;
import com.library.entity.Profile;
import com.library.entity.User;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User createUser(UserDTO dto) {
        Profile profile =
                Profile.builder()
                        .email(dto.getEmail())
                        .phone(dto.getPhone())
                        .address(dto.getAddress())
                        .build();

        User user = User.builder().name(dto.getName()).profile(profile).build();
        profile.setUser(user);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public User updateUser(Long id, UserDTO dto) {
        User user = getUserById(id);
        user.setName(dto.getName());
        if (user.getProfile() == null) {
            user.setProfile(new Profile());
        }
        user.getProfile().setEmail(dto.getEmail());
        user.getProfile().setPhone(dto.getPhone());
        user.getProfile().setAddress(dto.getAddress());
        user.getProfile().setUser(user);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
}

