package com.sustainshare.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sustainshare.backend.model.DonationLog;

import jakarta.persistence.LockModeType;

@Repository
public interface DonationLogRepository extends JpaRepository<DonationLog, Long> {
    // Add filter by donor or charity if needed

    @Query("SELECT COUNT(DISTINCT d.donor.id) FROM DonationLog d")
    long countDistinctDonors();

    @Query("SELECT COUNT(d) FROM DonationLog d WHERE d.claimedAt IS NOT NULL")
    long countClaimedDonations();

    @Query("SELECT COALESCE(SUM(d.foodItem.quantity), 0) FROM DonationLog d")
    long sumFoodQuantity();

    // Fetch by food item id
    Optional<DonationLog> findByFoodItem_Id(Long foodItemId);

    // Lock the corresponding donation log row to prevent concurrent claims
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM DonationLog d WHERE d.foodItem.id = :foodItemId")
    Optional<DonationLog> findByFoodItemIdForUpdate(@Param("foodItemId") Long foodItemId);

    // Find all donation logs for a food item
    java.util.List<DonationLog> findAllByFoodItem_Id(Long foodItemId);

    // Delete all donation logs for a food item
    void deleteByFoodItem_Id(Long foodItemId);
}
