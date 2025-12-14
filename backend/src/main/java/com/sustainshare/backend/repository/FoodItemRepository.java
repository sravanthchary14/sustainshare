package com.sustainshare.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sustainshare.backend.model.FoodItem;

import jakarta.persistence.LockModeType;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    // Custom queries (optional) can go here

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM FoodItem f WHERE f.id = :id")
    Optional<FoodItem> findByIdForUpdate(@Param("id") Long id);

    // Available = no DonationLog with both charity set and claimedAt set (use NOT EXISTS to avoid NULL issues)
    @Query("SELECT f FROM FoodItem f WHERE NOT EXISTS (SELECT d FROM DonationLog d WHERE d.foodItem = f AND d.charity IS NOT NULL AND d.claimedAt IS NOT NULL)")
    java.util.List<FoodItem> findAllAvailable();
}
