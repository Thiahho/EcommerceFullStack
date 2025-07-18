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
-- Temporary view structure for view `vcelularmbp`
--

DROP TABLE IF EXISTS `vcelularmbp`;
/*!50001 DROP VIEW IF EXISTS `vcelularmbp`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vcelularmbp` AS SELECT 
 1 AS `marca`,
 1 AS `modelo`,
 1 AS `arreglomodulo`,
 1 AS `arreglobat`,
 1 AS `arreglopin`,
 1 AS `color`,
 1 AS `tipo`,
 1 AS `version`,
 1 AS `marco`,
 1 AS `placa`,
 1 AS `tipopin`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vcelularp`
--

DROP TABLE IF EXISTS `vcelularp`;
/*!50001 DROP VIEW IF EXISTS `vcelularp`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vcelularp` AS SELECT 
 1 AS `marca`,
 1 AS `modelo`,
 1 AS `costo`,
 1 AS `placa`,
 1 AS `tipo`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vcelularb`
--

DROP TABLE IF EXISTS `vcelularb`;
/*!50001 DROP VIEW IF EXISTS `vcelularb`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vcelularb` AS SELECT 
 1 AS `celularid`,
 1 AS `modelo`,
 1 AS `marca`,
 1 AS `tipo`,
 1 AS `arreglobateria`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vcelularm`
--

DROP TABLE IF EXISTS `vcelularm`;
/*!50001 DROP VIEW IF EXISTS `vcelularm`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vcelularm` AS SELECT 
 1 AS `celularid`,
 1 AS `modelo`,
 1 AS `marca`,
 1 AS `color`,
 1 AS `marco`,
 1 AS `tipo`,
 1 AS `version`,
 1 AS `arreglomodulo`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vcelularmbp`
--

/*!50001 DROP VIEW IF EXISTS `vcelularmbp`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vcelularmbp` AS select distinct `c`.`marca` AS `marca`,`c`.`modelo` AS `modelo`,`m`.`arreglo` AS `arreglomodulo`,`b`.`arreglo` AS `arreglobat`,`p`.`arreglo` AS `arreglopin`,`m`.`color` AS `color`,`m`.`tipo` AS `tipo`,`m`.`version` AS `version`,`m`.`marco` AS `marco`,`p`.`placa` AS `placa`,`p`.`tipo` AS `tipopin` from (((`celulares` `c` left join `modulos` `m` on(((`c`.`marca` = `m`.`marca`) and (`c`.`modelo` = `m`.`modelo`)))) left join `baterias` `b` on(((`c`.`marca` = `b`.`marca`) and (`c`.`modelo` = `b`.`modelo`)))) left join `pines` `p` on(((`c`.`marca` = `p`.`marca`) and (`c`.`modelo` = `p`.`modelo`)))) where ((`c`.`marca` is not null) and (`c`.`modelo` is not null)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vcelularp`
--

/*!50001 DROP VIEW IF EXISTS `vcelularp`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vcelularp` AS select `c`.`marca` AS `marca`,`c`.`modelo` AS `modelo`,min(`p`.`costo`) AS `costo`,substring_index(group_concat(`p`.`placa` order by `p`.`marca` ASC,`p`.`modelo` ASC separator '||'),'||',1) AS `placa`,substring_index(group_concat(`p`.`tipo` order by `p`.`marca` ASC,`p`.`modelo` ASC separator '||'),'||',1) AS `tipo` from (`celulares` `c` join `pines` `p` on((`p`.`marca` = `c`.`marca`))) group by `c`.`marca`,`c`.`modelo` order by `c`.`marca`,`c`.`modelo` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vcelularb`
--

/*!50001 DROP VIEW IF EXISTS `vcelularb`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vcelularb` AS select `c`.`id` AS `celularid`,`c`.`modelo` AS `modelo`,`c`.`marca` AS `marca`,`b`.`tipo` AS `tipo`,`b`.`arreglo` AS `arreglobateria` from (`celulares` `c` left join `baterias` `b` on(((`c`.`modelo` = `b`.`modelo`) and (`c`.`marca` = `b`.`marca`)))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vcelularm`
--

/*!50001 DROP VIEW IF EXISTS `vcelularm`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vcelularm` AS select `c`.`id` AS `celularid`,`c`.`modelo` AS `modelo`,`c`.`marca` AS `marca`,`m`.`color` AS `color`,`m`.`marco` AS `marco`,`m`.`tipo` AS `tipo`,`m`.`version` AS `version`,`m`.`arreglo` AS `arreglomodulo` from (`celulares` `c` left join `modulos` `m` on(((`c`.`modelo` = `m`.`modelo`) and (`c`.`marca` = `m`.`marca`)))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-18 16:38:02
