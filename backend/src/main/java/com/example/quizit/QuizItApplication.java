package com.example.quizit;

import com.example.quizit.features.emailService.EmailService;
import com.example.quizit.features.examMode.ExamModeService;
import com.example.quizit.features.examMode.ExamRedisService;
import com.example.quizit.features.role.Role;
import com.example.quizit.features.role.RoleRepository;
import com.example.quizit.security.AppConstraint;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class QuizItApplication implements CommandLineRunner {

    @Autowired
    private  RoleRepository roleRepository;
    @Autowired
    private EmailService emailService;

    @Autowired
    private ExamRedisService examRedisService;

    public static void main(String[] args) {
        SpringApplication.run(QuizItApplication.class, args);
    }


    @Override

    public void run(String... args) throws Exception {
        //UNCOMMENT THIS PART TO ADD ROLE IN DATABASE
        roleRepository.findByName("ROLE_" + AppConstraint.ADMIN_ROLE).ifPresentOrElse(role -> {

        },()->{
            Role roleOb = Role
                    .builder()
                    .name("ROLE_" + AppConstraint.ADMIN_ROLE)
                    .build();

            roleRepository.save(roleOb);
        });

        roleRepository.findByName("ROLE_" + AppConstraint.USER_ROLE).ifPresentOrElse(role -> {

        },()->{
            Role roleOb = Role
                    .builder()
                    .name("ROLE_" + AppConstraint.USER_ROLE)
                    .build();

            roleRepository.save(roleOb);
        });

        roleRepository.findByName("ROLE_" + AppConstraint.TEACHER_ROLE).ifPresentOrElse(role -> {

        },()->{
            Role roleOb = Role
                    .builder()
                    .name("ROLE_" + AppConstraint.TEACHER_ROLE)
                    .build();

            roleRepository.save(roleOb);
        });


    }


}
