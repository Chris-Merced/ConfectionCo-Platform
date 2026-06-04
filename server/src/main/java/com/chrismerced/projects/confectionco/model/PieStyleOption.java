package com.chrismerced.projects.confectionco.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "pie_style_options")
public class PieStyleOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pie_type")
    private String pieType;

    private String name;

    @Column(name = "is_active")
    private boolean active = true;

    public Long getId() { return id; }
    public String getPieType() { return pieType; }
    public void setPieType(String pieType) { this.pieType = pieType; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
