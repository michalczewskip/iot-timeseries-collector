package pl.edu.pw.elka.iottimeseriescollector.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "series")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Series {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "min_value", nullable = false, precision = 19, scale = 4)
    private BigDecimal minValue;

    @Column(name = "max_value", nullable = false, precision = 19, scale = 4)
    private BigDecimal maxValue;

    @Column(name = "color", nullable = false, length = 7)
    private String color;

    @Column(name = "icon", columnDefinition = "TEXT")
    private String icon;

    @Column(name = "unit", length = 20)
    private String unit;
}