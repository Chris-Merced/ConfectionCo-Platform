package com.chrismerced.projects.confectionco.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.ButtercreamOption;

public interface ButtercreamOptionRepository extends JpaRepository<ButtercreamOption, Long> {
    List<ButtercreamOption> findByActiveTrue();
}
