CREATE DATABASE IF NOT EXISTS bestiu_rentals;
USE bestiu_rentals;

CREATE TABLE IF NOT EXISTS listings (
  id VARCHAR(20) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  area_key VARCHAR(60) NOT NULL,
  area VARCHAR(120) NOT NULL,
  district VARCHAR(120) NOT NULL,
  state VARCHAR(120) NOT NULL,
  rent_inr INT NOT NULL,
  distance_to_campus_km DECIMAL(6,2) NOT NULL,
  type VARCHAR(80) NOT NULL,
  suitable_for_json JSON NOT NULL,
  amenities_json JSON NOT NULL,
  contact VARCHAR(40) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_area_key (area_key),
  INDEX idx_rent (rent_inr),
  INDEX idx_distance (distance_to_campus_km)
);
