package com.sustainshare.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sustainshare.backend.model.DonationLog;
import com.sustainshare.backend.service.DonationLogService;
import com.sustainshare.backend.controller.dto.ClaimRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/donations")
public class DonationLogController {

    @Autowired
    private DonationLogService donationLogService;

    @GetMapping
    public List<DonationLog> getAllDonations() {
        return donationLogService.getAllDonations();
    }

    // New endpoint to get total donations count
    @GetMapping("/count")
    public long getTotalDonationsCount() {
        return donationLogService.getTotalDonationsCount();
    }

    // New endpoint to get claimed food count
    @GetMapping("/claimed/count")
    public long getClaimedFoodCount() {
        return donationLogService.getClaimedFoodCount();
    }

    // New endpoint to get total food quantity posted by donors
    @GetMapping("/foodquantity/total")
    public long getTotalFoodQuantity() {
        return donationLogService.getTotalFoodQuantity();
    }

    // Add POST endpoint to create a new donation log
    @PostMapping
    public DonationLog createDonationLog(@RequestBody DonationLog donationLog) {
        return donationLogService.createDonationLog(donationLog);
    }

    // Endpoint to claim a donation by foodItemId
    @PostMapping("/claim/{foodItemId}")
    public ResponseEntity<?> claimDonation(@PathVariable Long foodItemId, @RequestBody ClaimRequest request) {
        if (request == null || request.getCharityId() == null) {
            return ResponseEntity.badRequest().body("charityId is required");
        }
        return donationLogService.claimFood(foodItemId, request.getCharityId())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.CONFLICT).body("Already claimed or invalid IDs"));
    }

    // Add PUT endpoint to update an existing donation log
    @PutMapping("/{id}")
    public DonationLog updateDonationLog(@PathVariable Long id, @RequestBody DonationLog donationLog) {
        return donationLogService.updateDonationLog(id, donationLog);
    }
}
