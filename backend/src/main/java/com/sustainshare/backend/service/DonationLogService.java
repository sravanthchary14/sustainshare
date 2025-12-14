package com.sustainshare.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sustainshare.backend.model.DonationLog;
import com.sustainshare.backend.model.FoodItem;
import com.sustainshare.backend.model.User;
import com.sustainshare.backend.repository.DonationLogRepository;
import com.sustainshare.backend.repository.FoodItemRepository;
import com.sustainshare.backend.repository.UserRepository;

@Service
public class DonationLogService {

    @Autowired
    private DonationLogRepository donationLogRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private UserRepository userRepository;

    // Save new donation entry
    public DonationLog createDonationLog(DonationLog log) {
        return donationLogRepository.save(log);
    }

    // Update donation entry
    public DonationLog updateDonationLog(Long id, DonationLog log) {
        Optional<DonationLog> existingLog = donationLogRepository.findById(id);
        if (existingLog.isPresent()) {
            DonationLog updatedLog = existingLog.get();
            if (log.getDonor() != null) updatedLog.setDonor(log.getDonor());
            if (log.getCharity() != null) updatedLog.setCharity(log.getCharity());
            if (log.getFoodItem() != null) updatedLog.setFoodItem(log.getFoodItem());
            if (log.getDonatedAt() != null) updatedLog.setDonatedAt(log.getDonatedAt());
            if (log.getClaimedAt() != null) updatedLog.setClaimedAt(log.getClaimedAt());
            // Removed pickupLocation update as DonationLog model does not have this field
            return donationLogRepository.save(updatedLog);
        }
        return null;
    }

    // Get all donations
    public List<DonationLog> getAllDonations() {
        return donationLogRepository.findAll();
    }

    // Get by ID
    public Optional<DonationLog> getDonationById(Long id) {
        return donationLogRepository.findById(id);
    }

    // Delete
    public void deleteDonation(Long id) {
        donationLogRepository.deleteById(id);
    }

    // New method to get total donations count
    public long getTotalDonationsCount() {
        return donationLogRepository.count();
    }

    // New method to get claimed food count (donations with non-null claimedAt)
    public long getClaimedFoodCount() {
        return donationLogRepository.countClaimedDonations();
    }

    // New method to get total food quantity posted by donors
    public long getTotalFoodQuantity() {
        return donationLogRepository.sumFoodQuantity();
    }

    // Claim a food item by a charity, ensuring only one can claim
    @Transactional
    public Optional<DonationLog> claimFood(Long foodItemId, Long charityId) {
        // Lock the donation log row for this food item to prevent concurrent claims
        Optional<DonationLog> locked = donationLogRepository.findByFoodItemIdForUpdate(foodItemId);
        DonationLog log;
        if (locked.isPresent()) {
            log = locked.get();
        } else {
            // If no log exists yet, create one with donor inferred from FoodItem.donorId (if present)
            Optional<FoodItem> foodOpt = foodItemRepository.findByIdForUpdate(foodItemId);
            if (foodOpt.isEmpty()) return Optional.empty();
            FoodItem food = foodOpt.get();
            log = new DonationLog();
            if (food.getDonorId() != null) {
                userRepository.findById(food.getDonorId()).ifPresent(log::setDonor);
            }
            log.setFoodItem(food);
        }

        // If already claimed, do not allow another claim
        if (log.getClaimedAt() != null && log.getCharity() != null) {
            return Optional.empty();
        }

        Optional<User> charityOpt = userRepository.findById(charityId);
        if (charityOpt.isEmpty()) return Optional.empty();
        log.setCharity(charityOpt.get());
        log.setClaimedAt(java.time.LocalDateTime.now());
        DonationLog saved = donationLogRepository.save(log);
        return Optional.of(saved);
    }
}
