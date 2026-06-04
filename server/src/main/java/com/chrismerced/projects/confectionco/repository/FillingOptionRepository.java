package com.chrismerced.projects.confectionco.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.FillingOption;

public interface FillingOptionRepository extends JpaRepository<FillingOption, Long> {
    List<FillingOption> findByActiveTrue();
}
