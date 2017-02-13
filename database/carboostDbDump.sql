CREATE DATABASE  IF NOT EXISTS `carboost` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `carboost`;
-- MySQL dump 10.13  Distrib 5.7.12, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: carboost
-- ------------------------------------------------------
-- Server version	5.7.16-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attributions`
--

DROP TABLE IF EXISTS `attributions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attributions` (
  `student` varchar(255) NOT NULL,
  `skill` varchar(255) NOT NULL,
  `mark` int(11) DEFAULT NULL,
  PRIMARY KEY (`student`,`skill`),
  KEY `attributions_fk_skill_idx` (`skill`),
  CONSTRAINT `attributions_fk_skill` FOREIGN KEY (`skill`) REFERENCES `skills` (`name`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attributions_fk_student` FOREIGN KEY (`student`) REFERENCES `users` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attributions`
--

LOCK TABLES `attributions` WRITE;
/*!40000 ALTER TABLE `attributions` DISABLE KEYS */;
INSERT INTO `attributions` VALUES ('maxime.makhloufi@gmail.com','Anglais',5),('maxime.makhloufi@gmail.com','C++',4),('maxime.makhloufi@gmail.com','Java',3),('maxime.makhloufi@gmail.com','MySQL',4);
/*!40000 ALTER TABLE `attributions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classes` (
  `name` varchar(255) NOT NULL,
  `teacher` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `classes_fk_teacher_idx` (`teacher`),
  CONSTRAINT `classes_fk_teacher` FOREIGN KEY (`teacher`) REFERENCES `users` (`email`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES ('FISE2','christophe.gravier@gmail.com'),('FISE1','frederique.laforest@gmail.com'),('FISE3','jacques.fayolle@gmail.com');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `skills` (
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` VALUES ('Anglais'),('C'),('C#'),('C++'),('Html'),('Java'),('Javascript'),('LoL'),('Mathématiques'),('MySQL'),('PHP'),('Réseau');
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `level` int(11) NOT NULL DEFAULT '0',
  `class` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`email`),
  KEY `users_fk_class_idx` (`class`),
  CONSTRAINT `users_fk_class` FOREIGN KEY (`class`) REFERENCES `classes` (`name`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('admin@gmail.com','admintest','Admin','Admin',2,NULL),('christophe.gravier@gmail.com','123456','Christophe','Gravier',1,'FISE2'),('dali.mersel@gmail.com','123456','Maxime','Makhloufi',0,'FISE3'),('fabien.forestier@gmail.com','123456','Fabien','Forestier',0,'FISE2'),('frederique.laforest@gmail.com','123456','Frederique','Laforest',1,'FISE1'),('guillaume.terpend@gmail.com','123456','Guillaume','Terpend',0,'FISE1'),('jacques.fayolle@gmail.com','123456','Jacques','Fayolle',1,'FISE3'),('maxime.makhloufi@gmail.com','123456','Maxime','Makhloufi',0,'FISE1'),('nicolas.rivat@gmail.com','123456','Nicolas','Rivat',0,NULL),('oussama.boualem@gmail.com','123456','Oussama','Boualem',0,'FISE3'),('robin.vanet@gmail.com','123456','Robin','Vanet',0,'FISE2'),('yann.carrio@gmail.com','123456','Yann','Carrio',0,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-02-13 21:21:59
