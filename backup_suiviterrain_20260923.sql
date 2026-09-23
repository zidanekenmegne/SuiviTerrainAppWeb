--
-- PostgreSQL database dump
--

\restrict AE8PmtrBSOAqNBUK7hwHTJtxMTdauFjBpoZ0JXOTMCPygntm1IzpDBhtL2ZkaNb

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categorie; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorie (
    id_cat integer NOT NULL,
    nom_cat character varying(50) NOT NULL,
    couleur character varying(7) NOT NULL,
    date_creation_cat timestamp without time zone
);


ALTER TABLE public.categorie OWNER TO postgres;

--
-- Name: categorie_id_cat_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorie_id_cat_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorie_id_cat_seq OWNER TO postgres;

--
-- Name: categorie_id_cat_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorie_id_cat_seq OWNED BY public.categorie.id_cat;


--
-- Name: journal_connexion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_connexion (
    id_journal integer NOT NULL,
    horodatage timestamp without time zone,
    adresse_ip character varying(45),
    id_user integer NOT NULL
);


ALTER TABLE public.journal_connexion OWNER TO postgres;

--
-- Name: journal_connexion_id_journal_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journal_connexion_id_journal_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_connexion_id_journal_seq OWNER TO postgres;

--
-- Name: journal_connexion_id_journal_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journal_connexion_id_journal_seq OWNED BY public.journal_connexion.id_journal;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id_notification integer NOT NULL,
    type character varying(30) NOT NULL,
    titre character varying(200) NOT NULL,
    message text NOT NULL,
    lien character varying(255),
    lu boolean NOT NULL,
    date_creation timestamp without time zone,
    id_user integer NOT NULL
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- Name: notification_id_notification_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_id_notification_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_id_notification_seq OWNER TO postgres;

--
-- Name: notification_id_notification_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_id_notification_seq OWNED BY public.notification.id_notification;


--
-- Name: point_de_vente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.point_de_vente (
    id_pt integer NOT NULL,
    nom_pt character varying(100) NOT NULL,
    adresse text NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    telephone character varying(20),
    photo character varying(255),
    date_creation_pt timestamp without time zone,
    date_modif timestamp without time zone,
    id_cat integer
);


ALTER TABLE public.point_de_vente OWNER TO postgres;

--
-- Name: point_de_vente_id_pt_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.point_de_vente_id_pt_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.point_de_vente_id_pt_seq OWNER TO postgres;

--
-- Name: point_de_vente_id_pt_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.point_de_vente_id_pt_seq OWNED BY public.point_de_vente.id_pt;


--
-- Name: realiser; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realiser (
    id_user integer NOT NULL,
    id_visite integer NOT NULL
);


ALTER TABLE public.realiser OWNER TO postgres;

--
-- Name: utilisateur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utilisateur (
    id_user integer NOT NULL,
    nom_user character varying(100) NOT NULL,
    mail character varying(150) NOT NULL,
    mdp character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    zone_intervention character varying(100),
    actif boolean,
    photo character varying(255),
    date_creation_user timestamp without time zone,
    derniere_connexion_user timestamp without time zone
);


ALTER TABLE public.utilisateur OWNER TO postgres;

--
-- Name: utilisateur_id_user_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utilisateur_id_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.utilisateur_id_user_seq OWNER TO postgres;

--
-- Name: utilisateur_id_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utilisateur_id_user_seq OWNED BY public.utilisateur.id_user;


--
-- Name: visite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visite (
    id_visite integer NOT NULL,
    date_prevue date NOT NULL,
    heure_prevue time without time zone NOT NULL,
    date_reelle date,
    heure_reelle time without time zone,
    compte_rendu text,
    statut character varying(20) NOT NULL,
    date_creation timestamp without time zone,
    date_modif timestamp without time zone,
    id_pt integer
);


ALTER TABLE public.visite OWNER TO postgres;

--
-- Name: visite_id_visite_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visite_id_visite_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.visite_id_visite_seq OWNER TO postgres;

--
-- Name: visite_id_visite_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.visite_id_visite_seq OWNED BY public.visite.id_visite;


--
-- Name: categorie id_cat; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorie ALTER COLUMN id_cat SET DEFAULT nextval('public.categorie_id_cat_seq'::regclass);


--
-- Name: journal_connexion id_journal; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_connexion ALTER COLUMN id_journal SET DEFAULT nextval('public.journal_connexion_id_journal_seq'::regclass);


--
-- Name: notification id_notification; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification ALTER COLUMN id_notification SET DEFAULT nextval('public.notification_id_notification_seq'::regclass);


--
-- Name: point_de_vente id_pt; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_de_vente ALTER COLUMN id_pt SET DEFAULT nextval('public.point_de_vente_id_pt_seq'::regclass);


--
-- Name: utilisateur id_user; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateur ALTER COLUMN id_user SET DEFAULT nextval('public.utilisateur_id_user_seq'::regclass);


--
-- Name: visite id_visite; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visite ALTER COLUMN id_visite SET DEFAULT nextval('public.visite_id_visite_seq'::regclass);


--
-- Data for Name: categorie; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorie (id_cat, nom_cat, couleur, date_creation_cat) FROM stdin;
1	Alimentation	#28a745	2026-09-23 13:10:36.343855
2	Services	#007bff	2026-09-23 13:10:36.343948
3	Vêtement	#ffc107	2026-09-23 13:10:36.343981
4	Électronique	#dc3545	2026-09-23 13:10:36.344011
5	Immobilier	#6f42c1	2026-09-23 13:10:36.344039
\.


--
-- Data for Name: journal_connexion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_connexion (id_journal, horodatage, adresse_ip, id_user) FROM stdin;
1	2026-09-23 13:15:00.509356	127.0.0.1	1
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id_notification, type, titre, message, lien, lu, date_creation, id_user) FROM stdin;
\.


--
-- Data for Name: point_de_vente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.point_de_vente (id_pt, nom_pt, adresse, latitude, longitude, telephone, photo, date_creation_pt, date_modif, id_cat) FROM stdin;
1	Magasin A - Centre-ville	123 Rue de Paris, Douala	4.0510560	9.7678690	699999999	\N	2026-09-23 13:10:36.369536	\N	1
2	Client B - Bonamoussadi	45 Avenue de l'Indépendance, Douala	4.0583000	9.7386000	688888888	\N	2026-09-23 13:10:36.369656	\N	2
3	Magasin C - Akwa	78 Rue Joss, Douala	4.0456000	9.6923000	677777777	\N	2026-09-23 13:10:36.369715	\N	1
\.


--
-- Data for Name: realiser; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realiser (id_user, id_visite) FROM stdin;
\.


--
-- Data for Name: utilisateur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.utilisateur (id_user, nom_user, mail, mdp, role, zone_intervention, actif, photo, date_creation_user, derniere_connexion_user) FROM stdin;
2	Agent Test	agent@suiviterrain.com	scrypt:32768:8:1$Ci8KXq9THvv6mjDm$ba656f8645b574a2b06ea925e3096ad43890132b3d25bdec5eeff8dc35df9a7ef8cde262e2570b89e7c0a71590a7986b32cb6c48f5ae7a1dc5ac5f529cc25b97	agent	\N	t	\N	2026-09-23 13:10:36.299097	\N
1	Admin SuiviTerrain	admin@suiviterrain.com	scrypt:32768:8:1$YLuX1BzGVDFNwQWt$9f89fe978e1e2158bc871d7a7deb795a77b46e5418dd583b19db9861df7cbabc62158883bcee5961929577cc843a7e0266d950b8447cdb7a363f668db6f9a9f1	admin	\N	t	\N	2026-09-23 13:10:35.861678	2026-09-23 13:15:00.509689
\.


--
-- Data for Name: visite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visite (id_visite, date_prevue, heure_prevue, date_reelle, heure_reelle, compte_rendu, statut, date_creation, date_modif, id_pt) FROM stdin;
\.


--
-- Name: categorie_id_cat_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorie_id_cat_seq', 5, true);


--
-- Name: journal_connexion_id_journal_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journal_connexion_id_journal_seq', 1, true);


--
-- Name: notification_id_notification_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_id_notification_seq', 1, false);


--
-- Name: point_de_vente_id_pt_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.point_de_vente_id_pt_seq', 3, true);


--
-- Name: utilisateur_id_user_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utilisateur_id_user_seq', 2, true);


--
-- Name: visite_id_visite_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visite_id_visite_seq', 1, false);


--
-- Name: categorie categorie_nom_cat_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorie
    ADD CONSTRAINT categorie_nom_cat_key UNIQUE (nom_cat);


--
-- Name: categorie categorie_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorie
    ADD CONSTRAINT categorie_pkey PRIMARY KEY (id_cat);


--
-- Name: journal_connexion journal_connexion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_connexion
    ADD CONSTRAINT journal_connexion_pkey PRIMARY KEY (id_journal);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id_notification);


--
-- Name: point_de_vente point_de_vente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_de_vente
    ADD CONSTRAINT point_de_vente_pkey PRIMARY KEY (id_pt);


--
-- Name: realiser realiser_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realiser
    ADD CONSTRAINT realiser_pkey PRIMARY KEY (id_user, id_visite);


--
-- Name: utilisateur utilisateur_mail_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_mail_key UNIQUE (mail);


--
-- Name: utilisateur utilisateur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id_user);


--
-- Name: visite visite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visite
    ADD CONSTRAINT visite_pkey PRIMARY KEY (id_visite);


--
-- Name: journal_connexion journal_connexion_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_connexion
    ADD CONSTRAINT journal_connexion_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.utilisateur(id_user);


--
-- Name: notification notification_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.utilisateur(id_user);


--
-- Name: point_de_vente point_de_vente_id_cat_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_de_vente
    ADD CONSTRAINT point_de_vente_id_cat_fkey FOREIGN KEY (id_cat) REFERENCES public.categorie(id_cat);


--
-- Name: realiser realiser_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realiser
    ADD CONSTRAINT realiser_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.utilisateur(id_user);


--
-- Name: realiser realiser_id_visite_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realiser
    ADD CONSTRAINT realiser_id_visite_fkey FOREIGN KEY (id_visite) REFERENCES public.visite(id_visite);


--
-- Name: visite visite_id_pt_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visite
    ADD CONSTRAINT visite_id_pt_fkey FOREIGN KEY (id_pt) REFERENCES public.point_de_vente(id_pt);


--
-- PostgreSQL database dump complete
--

\unrestrict AE8PmtrBSOAqNBUK7hwHTJtxMTdauFjBpoZ0JXOTMCPygntm1IzpDBhtL2ZkaNb

