package com.sustainshare.backend.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sustainshare.backend.model.DonationLog;
import com.sustainshare.backend.model.User;
import com.sustainshare.backend.service.DonationLogService;
import com.sustainshare.backend.service.FoodItemService;
import com.sustainshare.backend.service.UserService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private DonationLogService donationLogService;

    @Autowired
    private UserService userService;

    @Autowired
    private FoodItemService foodItemService;

    @GetMapping("/user/{userId}")
    public List<Map<String, Object>> getNotificationsForUser(@PathVariable Long userId) {
        List<Map<String, Object>> notifications = new ArrayList<>();
        User user = userService.getUserById(userId).orElse(null);

        if (user == null) {
            return notifications;
        }

        String role = user.getRole();

        if ("Charity".equals(role)) {
            // For Charity: Show all food posted by donors (available for claiming)
            List<DonationLog> donationLogs = donationLogService.getAllDonations();
            for (DonationLog log : donationLogs) {
                // Show food that hasn't been claimed yet or show all food donations
                Map<String, Object> notification = new HashMap<>();
                notification.put("id", "food_posted_" + log.getId());
                notification.put("type", "food_posted");
                notification.put("message", "New food posted: " + log.getFoodItem().getName() + " by " + log.getDonor().getName());
                notification.put("foodName", log.getFoodItem().getName());
                notification.put("donorName", log.getDonor().getName());
                notification.put("timestamp", log.getDonatedAt());
                notification.put("isRead", false);
                notifications.add(notification);
            }
        } else if ("Donor".equals(role)) {
            // For Donor: Show when their food is claimed by charities
            List<DonationLog> donationLogs = donationLogService.getAllDonations();
            for (DonationLog log : donationLogs) {
                if (log.getDonor() != null && log.getDonor().getId().equals(userId) && log.getCharity() != null) {
                    // Only show if this donor's food was claimed by a charity
                    Map<String, Object> notification = new HashMap<>();
                    notification.put("id", "food_claimed_" + log.getId());
                    notification.put("type", "food_claimed");
                    notification.put("message", "Your food '" + log.getFoodItem().getName() + "' was claimed by " + log.getCharity().getName());
                    notification.put("foodName", log.getFoodItem().getName());
                    notification.put("charityName", log.getCharity().getName());
                    notification.put("timestamp", log.getDonatedAt());
                    notification.put("isRead", false);
                    notifications.add(notification);
                }
            }
        } else if ("Admin".equals(role)) {
            // For Admin: New users, food donations, and food claims
            List<User> allUsers = userService.getAllUsers();
            for (User u : allUsers) {
                if (!u.getId().equals(userId)) { // Don't notify about self
                    Map<String, Object> notification = new HashMap<>();
                    notification.put("id", "user_" + u.getId());
                    notification.put("type", "new_user");
                    notification.put("message", "New user registered: " + u.getName() + " (" + u.getRole() + ")");
                    notification.put("userName", u.getName());
                    notification.put("userRole", u.getRole());
                    notification.put("timestamp", LocalDateTime.now());
                    notification.put("isRead", false);
                    notifications.add(notification);
                }
            }

            List<DonationLog> donationLogs = donationLogService.getAllDonations();
            for (DonationLog log : donationLogs) {
                // Notify about food donations
                Map<String, Object> donationNotification = new HashMap<>();
                donationNotification.put("id", "donation_" + log.getId());
                donationNotification.put("type", "food_donated");
                donationNotification.put("message", "Food donated: " + log.getFoodItem().getName() + " by " + log.getDonor().getName());
                donationNotification.put("foodName", log.getFoodItem().getName());
                donationNotification.put("donorName", log.getDonor().getName());
                donationNotification.put("timestamp", log.getDonatedAt());
                donationNotification.put("isRead", false);
                notifications.add(donationNotification);

                // Notify about food claims (if claimed)
                if (log.getCharity() != null) {
                    Map<String, Object> claimNotification = new HashMap<>();
                    claimNotification.put("id", "claim_" + log.getId());
                    claimNotification.put("type", "food_claimed");
                    claimNotification.put("message", "Food claimed: " + log.getFoodItem().getName() + " by " + log.getCharity().getName());
                    claimNotification.put("foodName", log.getFoodItem().getName());
                    claimNotification.put("charityName", log.getCharity().getName());
                    claimNotification.put("timestamp", log.getDonatedAt());
                    claimNotification.put("isRead", false);
                    notifications.add(claimNotification);
                }
            }
        }

        return notifications;
    }
}
