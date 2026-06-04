package com.chrismerced.projects.confectionco.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chrismerced.projects.confectionco.model.CheesecakeCrustOption;

public interface CheesecakeCrustOptionRepository extends JpaRepository<CheesecakeCrustOption, Long> {
    List<CheesecakeCrustOption> findByActiveTrue();
}
