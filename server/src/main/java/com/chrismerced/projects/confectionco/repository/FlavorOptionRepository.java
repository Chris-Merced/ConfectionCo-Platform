package com.chrismerced.projects.confectionco.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.FlavorOption;

public interface FlavorOptionRepository extends JpaRepository<FlavorOption, Long> {
    List<FlavorOption> findByItemTypeAndActiveTrue(String itemType);
}
