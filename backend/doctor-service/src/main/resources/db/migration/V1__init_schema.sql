SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;
SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '07bdeef8-b889-11f1-b3ca-ef757e16f58a:1-105';
DROP TABLE IF EXISTS `doctor_availability`;
CREATE TABLE `doctor_availability` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `day_of_week` enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') NOT NULL,
  `doctor_id` bigint NOT NULL,
  `end_time` time(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `start_time` time(6) NOT NULL,
  `department_id` bigint NOT NULL,
  `hospital_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DROP TABLE IF EXISTS `doctor_hospital_assignments`;
CREATE TABLE `doctor_hospital_assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `department_id` bigint NOT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `doctor_id` bigint NOT NULL,
  `hospital_id` bigint NOT NULL,
  `status` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKpudm7cwbltoq70xa00lm4awdk` (`doctor_id`,`hospital_id`,`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DROP TABLE IF EXISTS `doctor_profiles`;
CREATE TABLE `doctor_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bio` text,
  `created_at` datetime(6) DEFAULT NULL,
  `default_consultation_fee` double DEFAULT NULL,
  `doctor_id` bigint NOT NULL,
  `experience_years` int DEFAULT NULL,
  `profile_picture_url` varchar(255) DEFAULT NULL,
  `qualifications` varchar(255) DEFAULT NULL,
  `registration_number` varchar(255) DEFAULT NULL,
  `specializations` varchar(255) DEFAULT NULL,
  `status` enum('DRAFT','REVIEW','APPROVED','PUBLISHED') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_44wa7e9sdua1yw3x7k2u5qb3s` (`doctor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DROP TABLE IF EXISTS `doctors`;
CREATE TABLE `doctors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `consultation_fee` double DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `experience_years` int DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `is_available` bit(1) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `qualifications` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `specialty` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_caifv0va46t2mu85cg5afmayf` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
