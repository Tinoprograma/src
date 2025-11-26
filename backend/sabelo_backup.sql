-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: sabelo_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('20250929145636-create-users-table.js'),('20250929145912-create-artists-table.js'),('20250929145943-create-songs-table.js'),('20250929145958-create-annotations-table.js'),('20251006175236-add-is-verified-to-annotations.js'),('20251007015101-add-spotify-fields-to-songs.js'),('20251007161751-fix-artists-user-id.js'),('20251007161802-create-albums-table.js'),('20251007161827-add-album-id-to-songs.js'),('20251008185539-add-user-roles.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `albums`
--

DROP TABLE IF EXISTS `albums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `albums` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `artist_id` int NOT NULL,
  `slug` varchar(255) NOT NULL,
  `release_year` int DEFAULT NULL,
  `cover_image_url` varchar(500) DEFAULT NULL,
  `total_tracks` int DEFAULT '0' COMMENT 'Total de canciones en el álbum',
  `spotify_album_id` varchar(100) DEFAULT NULL COMMENT 'ID del álbum en Spotify',
  `spotify_uri` varchar(255) DEFAULT NULL,
  `spotify_external_url` varchar(500) DEFAULT NULL,
  `description` text COMMENT 'Descripción del álbum',
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_albums_artist_id` (`artist_id`),
  KEY `idx_albums_slug` (`slug`),
  CONSTRAINT `albums_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `albums`
--

LOCK TABLES `albums` WRITE;
/*!40000 ALTER TABLE `albums` DISABLE KEYS */;
INSERT INTO `albums` VALUES (1,'El chabo',7,'el-chabo',2020,NULL,0,NULL,NULL,NULL,'geng',1,'2025-10-07 22:22:36','2025-10-07 22:22:36'),(2,'Finally Rich',10,'finally-rich',2012,NULL,1,NULL,NULL,NULL,'Debut influyente: \"Finally Rich\" marcó la entrada de Chief Keef en la escena musical, estableciendo su estilo y el sonido del drill. \nLetras y temas: Las letras del álbum reflejan el ascenso de Chief Keef a la fama y la riqueza, pero también mantienen un fuerte vínculo con su origen en Chicago y sus compañeros. \nTemas de la canción: \"Finally Rich\" (la canción) es un ejemplo de esta dualidad, mostrando la celebración del éxito pero también la lealtad a su círculo cercano. \nLegado: La influencia de \"Finally Rich\" en muchos artistas actuales es significativa, y se le considera un álbum de rap clave. ',1,'2025-10-08 13:18:53','2025-10-08 13:19:03');
/*!40000 ALTER TABLE `albums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `annotations`
--

DROP TABLE IF EXISTS `annotations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `annotations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `song_id` int NOT NULL,
  `user_id` int NOT NULL,
  `text_selection` text NOT NULL,
  `start_char` int NOT NULL,
  `end_char` int NOT NULL,
  `explanation` longtext NOT NULL,
  `cultural_context` text,
  `upvotes` int DEFAULT '0',
  `downvotes` int DEFAULT '0',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('active','hidden','deleted') DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `annotations_song_id_start_char_end_char` (`song_id`,`start_char`,`end_char`),
  KEY `annotations_user_id` (`user_id`),
  KEY `annotations_upvotes` (`upvotes`),
  CONSTRAINT `annotations_ibfk_1` FOREIGN KEY (`song_id`) REFERENCES `songs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `annotations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `annotations`
--

LOCK TABLES `annotations` WRITE;
/*!40000 ALTER TABLE `annotations` DISABLE KEYS */;
INSERT INTO `annotations` VALUES (14,4,1,'Interesante',10,21,'Aca van las explicaciones ','Aca el contexto',4,0,0,'active','2025-10-13 23:47:07','2025-11-25 21:36:41'),(15,5,3,'Esta Letra No existe!',0,21,'adwsasdadsasddas','eweweq',0,0,0,'active','2025-11-25 21:38:37','2025-11-25 21:38:37'),(16,5,4,'Es una prueba',23,36,'Esta es otra explicacion','Contexto',6,0,0,'deleted','2025-11-25 23:10:27','2025-11-25 23:11:03'),(17,8,6,'Good boy',0,8,'aaaaaaaaaa','aaaaaaaa',0,0,0,'active','2025-11-25 23:59:32','2025-11-25 23:59:32');
/*!40000 ALTER TABLE `annotations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `artists`
--

DROP TABLE IF EXISTS `artists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `bio` text,
  `user_id` int DEFAULT NULL COMMENT 'Usuario que creó el artista',
  `image_url` varchar(500) DEFAULT NULL,
  `country_code` varchar(3) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `artists_country_code` (`country_code`),
  KEY `artists_verified` (`verified`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artists`
--

LOCK TABLES `artists` WRITE;
/*!40000 ALTER TABLE `artists` DISABLE KEYS */;
INSERT INTO `artists` VALUES (1,'Fernanfloo','fernanfloo',NULL,NULL,NULL,'AR',0,'2025-10-02 21:19:48','2025-10-02 21:19:48'),(7,'Marc Antony','marc-antony',NULL,1,NULL,'VE',0,'2025-10-07 22:16:27','2025-10-07 22:16:27'),(9,'csasasas','csasasas',NULL,1,NULL,'AR',0,'2025-10-07 23:19:31','2025-10-07 23:19:31'),(10,'Chief Kief','chief-kief',NULL,1,NULL,'AR',0,'2025-10-08 13:16:30','2025-10-08 13:16:30'),(11,'Post Malone','post-malone',NULL,1,NULL,'AR',0,'2025-10-13 23:26:38','2025-10-13 23:26:38'),(12,'PuebaCancion','puebacancion',NULL,3,NULL,'AR',0,'2025-11-25 21:37:39','2025-11-25 21:37:39'),(13,'Daddy Yankee','daddy-yankee',NULL,5,NULL,'AR',0,'2025-11-25 23:31:53','2025-11-25 23:31:53');
/*!40000 ALTER TABLE `artists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action` varchar(100) NOT NULL COMMENT 'Tipo de acción realizada',
  `entity_type` enum('annotation','song','album','artist','user') NOT NULL,
  `entity_id` int NOT NULL,
  `old_value` json DEFAULT NULL COMMENT 'Valor anterior (antes del cambio)',
  `new_value` json DEFAULT NULL COMMENT 'Valor nuevo (después del cambio)',
  `reason` text COMMENT 'Razón del cambio',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_admin_id` (`admin_id`),
  KEY `idx_audit_logs_entity` (`entity_type`,`entity_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'Canción eliminada','song',3,'{\"title\": \"Love Sosa\"}',NULL,'Sin especificar','2025-10-08 21:52:22'),(2,1,'Canción eliminada','song',1,'{\"title\": \"adsdasdas\"}',NULL,'Sin especificar','2025-10-08 21:52:31'),(3,1,'Canción eliminada','song',2,'{\"title\": \"sadsasd\"}',NULL,'Sin especificar','2025-10-08 21:52:36');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `songs`
--

DROP TABLE IF EXISTS `songs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `songs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `artist_id` int NOT NULL,
  `album_id` int DEFAULT NULL COMMENT 'ID del álbum al que pertenece (null si es single)',
  `track_number` int DEFAULT NULL COMMENT 'Número de track en el álbum',
  `is_single` tinyint(1) DEFAULT '0' COMMENT 'True si es un single (no pertenece a álbum)',
  `slug` varchar(255) NOT NULL,
  `lyrics` longtext NOT NULL,
  `album` varchar(255) DEFAULT NULL,
  `release_year` int DEFAULT NULL,
  `cover_image_url` varchar(500) DEFAULT NULL,
  `view_count` int DEFAULT '0',
  `annotation_count` int DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `spotify_track_id` varchar(100) DEFAULT NULL COMMENT 'ID del track en Spotify',
  `spotify_uri` varchar(255) DEFAULT NULL COMMENT 'URI de Spotify (spotify:track:xxxx)',
  `spotify_preview_url` varchar(500) DEFAULT NULL COMMENT 'URL de vista previa de 30 segundos',
  `spotify_external_url` varchar(500) DEFAULT NULL COMMENT 'URL pública de Spotify',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `songs_artist_id` (`artist_id`),
  KEY `songs_view_count` (`view_count`),
  KEY `idx_songs_album_id` (`album_id`),
  CONSTRAINT `songs_album_id_foreign_idx` FOREIGN KEY (`album_id`) REFERENCES `albums` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `songs_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `songs_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `songs`
--

LOCK TABLES `songs` WRITE;
/*!40000 ALTER TABLE `songs` DISABLE KEYS */;
INSERT INTO `songs` VALUES (4,'Rockstar',11,NULL,NULL,1,'rockstar','Letra muy Interesante para explicar',NULL,2025,'https://www.youtube.com/watch?v=UceaB4D0jpo',16,1,1,NULL,NULL,NULL,NULL,'2025-10-13 23:46:16','2025-11-25 23:11:21'),(5,'Esta Cancion Es una prueba',12,NULL,NULL,1,'esta-cancion-es-una-prueba','Esta Letra No existe! \nEs una prueba',NULL,2025,'https://cdn-icons-png.flaticon.com/512/3626/3626795.png',8,1,3,NULL,NULL,NULL,NULL,'2025-11-25 21:38:20','2025-11-25 23:11:03'),(6,'Gasolina',13,NULL,NULL,1,'gasolina','(Who\'s this?)\n¡Daddy Yankee!\n\nZúmbale mambo, pa\' que mis gatas prendan los motore\'\nZúmbale mambo, pa\' que mis gatas prendan los motore\'\nZúmbale mambo, pa\' que mis gatas prendan los motore\'\nQue se preparen, que lo que viene es pa\' que le den (¡duro!)\n\nMamita, yo sé que tú no te me vas a quitar (¡duro!)\nLo que me gusta es que tú te dejas llevar (¡duro!)\nTodos los weekend, ella sale a vacilar (¡duro!)\nMi gata no para de janguear, porque\n\nA ella le gusta la gasolina\n(¡Dame más gasolina!)\nCómo le encanta la gasolina\n(¡Dame más gasolina!)\n\nA ella le gusta la gasolina\n(¡Dame más gasolina!)\nCómo le encanta la gasolina\n(¡Dame más gasolina!)\n\nElla prende las turbinas, no discrimina\nNo se pierde ni un party de marquesina\nSe acicala hasta pa\' la esquina\nLuce tan bien que hasta la sombra le combina\n\nAsesina, me domina\nJanguea en carros, motoras y limosinas\nLlena su tanque de adrenalina\nCuando escucha reguetón en las bocinas\n\nA ella le gusta la gasolina\n(¡Dame más gasolina!)\nCómo le encanta la gasolina\n(¡Dame más gasolina!)\n\nA ella le gusta la gasolina\n(¡Dame más gasolina!)\nCómo le encanta la gasolina\n(¡Dame más gasolina!) yo\'\n\nAquí somos los mejores, no te me ajore\'\nEn la pista, nos llaman Los Matadore\'\nTú haces que cualquiera se enamore\nCuando bailas al ritmo de los tambore\'\n\nEsto va pa\' las gatas de to\' colore\'\nPa\' las mayore\', pa\' las menore\'\nPa\' las que son más zorras que los cazadore\'\nPa\' las mujeres que no apagan sus motore\'\n\nTenemos tú y yo algo pendiente\nTú me debe\' algo y lo sabe\'\nConmigo ella se pierde\nNo le rinde cuentas a nadie\n\nTenemos tú y yo algo pendiente\nTú me debe\' algo y lo sabe\'\nConmigo ella se pierde\nNo le rinde cuentas a nadie\n\nZúmbale mambo, pa\' que mis gatas prendan los motore\'\nZúmbale mambo, pa\' que mis gatas prendan los motore\'\nZúmbale mambo, pa\' que mis gatas prendan los motore\'\nQue se preparen, que lo que viene es pa\' que le den (¡duro!)\n\nMamita, yo sé que tú no te me vas a quitar (¡duro!)\nLo que me gusta es que tú te dejas llevar (¡duro!)\nTodos los weekend, ella sale a vacilar (¡duro!)\nMi gata no para de janguear, porque\n\nA ella le gusta la gasolina\n(¡Dame más gasolina!)\nCómo le encanta la gasolina\n(¡Dame más gasolina!)\n\nA ella le gusta la gasolina\n(¡Dame más gasolina!)\nCómo le encanta la gasolina\n(¡Dame más gasolina!)',NULL,2004,NULL,28,0,5,NULL,NULL,NULL,NULL,'2025-11-25 23:31:55','2025-11-26 00:16:30'),(7,'God\'s Plan',13,NULL,NULL,1,'gods-plan','And, they wishin\' and wishin\' and wishin\' and wishin\'\nThey wishin\' on me, yeah\nI been movin\' calm, don\'t start no trouble with me\nTryna keep it peaceful is a struggle for me\nDon\'t pull up at 6 AM to cuddle with me\nYou know how I like it when you lovin\' on me\nI don\'t wanna die for them to miss me\nYes, I see the things that they wishin\' on me\nHope I got some brothers that outlive me\nThey gon\' tell the story, shit was different with me\nGod\'s plan, God\'s plan\nI hold back, sometimes I won\'t, yeah\nI feel good, sometimes I don\'t, ayy, don\'t\nI finessed down Weston Road, ayy, \'nessed\nMight go down a G-O-D, yeah, wait\nI go hard on Southside G, yeah, Way\nI make sure that north side eat\nAnd still\nBad things\nIt\'s a lot of bad things\nThat they wishin\' and wishin\' and wishin\' and wishin\'\nThey wishin\' on me\nBad things\nIt\'s a lot of bad things\nThat they wishin\' and wishin\' and wishin\' and wishin\'\nThey wishin\' on me\nYeah, ayy, ayy (ayy)\nShe say, \"Do you love me?\" I tell her, \"Only partly\nI only love my bed and my momma, I\'m sorry\"\nFifty Dub, I even got it tatted on me\n81, they\'ll bring the crashers to the party\nAnd you know me\nTurn the O2 into the O3, dog\nWithout 40, Oli\', there\'d be no me\n\'Magine if I never met the broskis\nGod\'s plan, God\'s plan\nI can\'t do this on my own, ayy, no, ayy\nSomeone watchin\' this shit close, yep, close\nI\'ve been me since Scarlett Road, ayy, road, ayy\nMight go down as G-O-D, yeah, wait\nI go hard on Southside G, ayy, Way\nI make sure that north side eat, yuh\nAnd still\nBad things\nIt\'s a lot of bad things\nThat they wishin\' and wishin\' and wishin\' and wishin\'\nThey wishin\' on me\nYeah, yeah\nBad things\nIt\'s a lot of bad things\nThat they wishin\' and wishin\' and wishin\' and wishin\'\nThey wishin\' on me\nYeah',NULL,2018,NULL,4,0,6,NULL,NULL,NULL,NULL,'2025-11-25 23:56:54','2025-11-25 23:56:58'),(8,'Chantaje',13,NULL,NULL,1,'chantaje','Good boy\nCuando está bien, te alejas de mí\nTe sientes sola y siempre estoy ahí\nEs una guerra de toma y dame\nPues dame de eso que tiene ahí\nOye, baby, no seas mala (oh-no)\nNo me deje\' con las gana\'\nSe escucha en la calle que ya no me quiere\'\nVen y dímelo en la cara\nPregúntale a quién tú quieras\nVida, te juro que eso no es así\nYo nunca tuve una mala intención\nYo nunca quise burlarme de ti\nConmigo, ves, nunca se sabe\nUn día digo que no y otro que sí\nYo soy masoquista\nCon mi cuerpo, un egoísta\nTú eres puro, puro chantaje\nPuro, puro chantaje\nSiempre es a tu manera\nYo te quiero aunque no quiera\nTú eres puro, puro chantaje\nPuro, puro chantaje\nVas libre como el aire\nNo soy de ti ni de nadie\nCómo tú me tientas cuando tú mueve\'\nEso\' movimientos sexys siempre me entretiene\'\nSabe\' manipularme bien con tu cadera\nNo sé por qué me tienes en lista de espera\nTe dicen por ahí que voy haciendo y deshaciendo\nQue salgo cada noche, que te tengo ahí sufriendo\nQue en esta relación soy yo la que manda\nNo pares bola a toa esa mala propaganda\nPa-pa que te digo na, te comen el oído\nNo vaya\' a enderezar lo que no se ha torcido\nY como un loco sigo tras de ti, muriendo por ti\nDime, ¿qué hay pa mí, bebé? (¿Qué?)\nPregúntale a quién tú quieras\nVida, te juro que eso no es así\nYo nunca tuve una mala intención\nYo nunca quise burlarme de ti\nConmigo, ves, nunca se sabe\nUn día digo que no y otro que sí\nYo soy masoquista\nCon mi cuerpo, un egoísta\nTú eres puro, puro chantaje\nPuro, puro chantaje\nSiempre es a tu manera\nYo te quiero aunque no quiera\nTú eres puro, puro chantaje\nPuro, puro chantaje\nVas libre como el aire\nNo soy de ti ni de nadie\nEh-eh-eh-eh, nadie\nEh-eh-eh-eh, nadie\nEh-eh-eh-eh, nadie, nadie\nCon mi cuerpo, un egoísta\nTú eres puro, puro chantaje\nPuro, puro chantaje\nSiempre es a tu manera\nYo te quiero aunque no quiera\nTú eres puro, puro chantaje\nPuro, puro chantaje\nVas libre como el aire\nNo soy de ti ni de nadie\nEh-eh-eh-eh, nadie\nEh-eh-eh-eh, nadie\nEh-eh-eh-eh, nadie\n(Nadie, nadie) eh-eh-eh, eh-eh\nAlright, alright, baby, Shakira, Maluma\nPretty boy, Maluma, baby loba\nGood boy (yeah)\nColombia\nYou feel me\nPretty boy',NULL,2016,NULL,4,1,6,NULL,NULL,NULL,NULL,'2025-11-25 23:58:53','2025-11-26 00:00:15');
/*!40000 ALTER TABLE `songs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `display_name` varchar(100) DEFAULT NULL,
  `country_code` varchar(3) DEFAULT NULL,
  `reputation_score` int DEFAULT '0',
  `role` enum('user','moderator','admin') DEFAULT 'user' COMMENT 'Rol del usuario',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Si el usuario está activo',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'martinsalvo616@gmail.com','tinnchot','$2b$10$CeQGO/v3FAaHGqgQJrvONuovj0XoggrXvO0sp28hCZrWe4RrIgmY6','tupu','AR',0,'admin',1,'2025-10-02 15:44:00','2025-10-08 18:58:04'),(2,'cass@gmail.com','casasaas','$2b$10$FwdgSPsfbCw2plLdflY27OYe2nM6Qe7xyn5ZiUdjW8Auq2D6uQug6','asdasd','AR',0,'user',1,'2025-10-03 02:03:42','2025-10-03 02:03:42'),(3,'esteesunmaildeprueba@gmail.com','pruebaUser','$2b$10$y6J0.4GHhlxKBhtDzvL39ejeufNBebJHq5R62xFuOpWt4RjXbbmQW','UserDePrueba','AR',0,'user',1,'2025-11-25 21:36:10','2025-11-25 21:36:10'),(4,'prueba@gmail.com','estaesunaprueba','$2b$10$NqOfWt0ZlJG4VSSXqP72W.R/1yFnBLHKPMsvX51jhJCaxUkqPhE6S','Prueba123','AR',0,'user',1,'2025-11-25 23:05:49','2025-11-25 23:05:49'),(5,'maildeprueba@gmail.com','usuariodepruebaaaa','$2b$10$dLRx7wNZCEzeHQKk3aGI1uDIF8bhw6QSkNVfhgYJ9ok5nAaSDa6Su','PruebaAhoraSi','AR',0,'user',1,'2025-11-25 23:31:10','2025-11-25 23:31:10'),(6,'mailprueba@hotmail.com','pruebaprueba','$2b$10$nbsZj0WafW3MsZI9pHXYpO.9I/20cAQ/0kcI8wDQJ6EEh26pA0uhu','AhoraFuncionandoPLS','AR',0,'user',1,'2025-11-25 23:55:31','2025-11-25 23:55:31'),(7,'maildeprueba11111@hotmail.com','pruebause111111','$2b$10$HpkzEJ/7wXGNbX9Du0nMneH6ZqlvSGfwvipuOsQltuVEIDt6CE.T6','11111111','AR',0,'user',1,'2025-11-26 00:03:02','2025-11-26 00:03:02');
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

-- Dump completed on 2025-11-26 21:03:10
