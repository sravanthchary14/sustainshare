package com.sustainshare.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.sustainshare.backend.model.User;
import com.sustainshare.backend.service.UserService;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        try {
            createDemoUsers();
        } catch (Exception e) {
            // Log and continue startup instead of failing the entire application
            System.err.println("DataInitializer failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void createDemoUsers() {
        // Create demo donor user (ensure unique email, username, and non-null phone)
        if (!userService.isEmailTaken("donor@example.com") && !userService.isUsernameTaken("demodonor")) {
            User donor = new User();
            donor.setName("Demo Donor");
            donor.setUsername("demodonor");
            donor.setEmail("donor@example.com");
            donor.setPhone("1111111111");
            donor.setPassword("donorpass");
            donor.setRole("Donor");
            userService.registerUser(donor);
            System.out.println("Demo donor user created");
        }

        // Create demo charity user (ensure unique email, username, and non-null phone)
        if (!userService.isEmailTaken("charity@example.com") && !userService.isUsernameTaken("democharity")) {
            User charity = new User();
            charity.setName("Demo Charity");
            charity.setUsername("democharity");
            charity.setEmail("charity@example.com");
            charity.setPhone("2222222222");
            charity.setPassword("charitypass");
            charity.setRole("Charity");
            userService.registerUser(charity);
            System.out.println("Demo charity user created");
        }

        // Create demo admin user (ensure unique email, username, and non-null phone)
        if (!userService.isEmailTaken("admin@example.com") && !userService.isUsernameTaken("demoadmin")) {
            User admin = new User();
            admin.setName("Demo Admin");
            admin.setUsername("demoadmin");
            admin.setEmail("admin@example.com");
            admin.setPhone("3333333333");
            admin.setPassword("adminpass");
            admin.setRole("Admin");
            userService.registerUser(admin);
            System.out.println("Demo admin user created");
        }
    }
}
