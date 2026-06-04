package com.chrismerced.projects.confectionco.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.PieStyleOption;

public interface PieStyleOptionRepository extends JpaRepository<PieStyleOption, Long> {
    List<PieStyleOption> findByPieTypeAndActiveTrue(String pieType);
    List<PieStyleOption> findByActiveTrue();
}
