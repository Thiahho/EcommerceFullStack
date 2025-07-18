-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: drcell
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `productos_variantes`
--

DROP TABLE IF EXISTS `productos_variantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos_variantes` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'TRIAL',
  `productoid` int NOT NULL COMMENT 'TRIAL',
  `stock` int DEFAULT NULL COMMENT 'TRIAL',
  `color` varchar(100) NOT NULL COMMENT 'TRIAL',
  `ram` varchar(100) DEFAULT NULL COMMENT 'TRIAL',
  `precio` decimal(18,2) DEFAULT NULL COMMENT 'TRIAL',
  `almacenamiento` longtext COMMENT 'TRIAL',
  `trial980` char(1) DEFAULT NULL COMMENT 'TRIAL',
  PRIMARY KEY (`id`),
  KEY `fk_producto` (`productoid`),
  CONSTRAINT `fk_producto` FOREIGN KEY (`productoid`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb3 COMMENT='TRIAL';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos_variantes`
--

LOCK TABLES `productos_variantes` WRITE;
/*!40000 ALTER TABLE `productos_variantes` DISABLE KEYS */;
INSERT INTO `productos_variantes` VALUES (31,9,1,'Dorado','8GB',570000.00,'256GB','T'),(32,9,1,'Dorado','12GB',500000.00,'128GB','T'),(33,10,1,'Negro','6GB',230000.00,'64GB','T'),(34,11,1,'Negro','8GB',501000.00,'128GB','T'),(35,12,1,'Rojo','8GB',420000.00,'128GB','T');
/*!40000 ALTER TABLE `productos_variantes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-18 16:38:02
