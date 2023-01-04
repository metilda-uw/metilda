--
-- PostgreSQL database dump
--

-- Dumped from database version 14.0
-- Dumped by pg_dump version 14.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis (
    analysis_id integer NOT NULL,
    analysis_file_name character varying(150) NOT NULL,
    analysis_file_path character varying(355) NOT NULL,
    audio_id integer NOT NULL,
    generated_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: analysis_analysis_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.analysis_analysis_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: analysis_analysis_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.analysis_analysis_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: analysis_analysis_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.analysis_analysis_id_seq1 OWNED BY public.analysis.analysis_id;

--
-- Name: audio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collections
(
    collection_id integer NOT NULL,
    collection_luid uuid,
    collection_name character varying(50) COLLATE pg_catalog."default",
    owner_id character varying COLLATE pg_catalog."default",
    created_at timestamp without time zone,
    collection_description text COLLATE pg_catalog."default",
    
    CONSTRAINT collections_pkey PRIMARY KEY (collection_id)
);

CREATE SEQUENCE public.collections_collection_id_seq
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.collections_collection_id_seq OWNED BY public.collections.collection_id;




CREATE TABLE public.audio (
    audio_id integer NOT NULL,
    file_name character varying(150) NOT NULL,
    file_path character varying(355) NOT NULL,
    file_size integer NOT NULL,
    file_type character varying(150) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_id character varying NOT NULL
);


--
-- Name: audio_audio_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audio_audio_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: audio_audio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audio_audio_id_seq OWNED BY public.audio.audio_id;


--
-- Name: eaf; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eaf (
    eaf_id integer NOT NULL,
    eaf_file_name character varying(150) NOT NULL,
    eaf_file_path character varying(355) NOT NULL,
    audio_id integer,
    generated_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: eaf_eaf_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.eaf_eaf_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: eaf_eaf_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.eaf_eaf_id_seq OWNED BY public.eaf.eaf_id;


--
-- Name: files_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.files_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image (
    image_id integer NOT NULL,
    image_name character varying(150) NOT NULL,
    image_path character varying(355) NOT NULL,
    legend_path character varying(355),
    created_at timestamp without time zone NOT NULL,
    user_id character varying NOT NULL
);


--
-- Name: image_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_analysis (
    analysis_id integer NOT NULL,
    image_id integer NOT NULL
);


--
-- Name: image_image_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.image_image_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: image_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.image_image_id_seq OWNED BY public.image.image_id;


--
-- Name: images_image_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.images_image_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: letter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.letter (
    id character varying NOT NULL,
    syllable character varying,
    word_id character varying,
    t0 numeric,
    t1 numeric,
    pitch numeric,
    is_manual_pitch boolean,
    is_word_sep boolean,
    order_index integer
);


--
-- Name: recording_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recording_info (
    audio_id integer NOT NULL,
    number_of_syllables integer NOT NULL,
    recording_name character varying(150) NOT NULL
);


--
-- Name: test; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test (
);


--
-- Name: user_research_language; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_research_language (
    user_id character varying NOT NULL,
    user_language character varying(150) NOT NULL
);


--
-- Name: user_role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_role (
    user_id character varying NOT NULL,
    user_role character varying(150) NOT NULL,
    verified boolean
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id character varying NOT NULL,
    university character varying(355),
    created_at timestamp without time zone NOT NULL,
    last_login timestamp without time zone NOT NULL,
    user_name character varying(100) NOT NULL
);


--
-- Name: word; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.word (
    id character varying NOT NULL,
    user_id character varying,
    num_syllables integer,
    accent_index integer,
    min_pitch integer,
    max_pitch integer,
    image_path text
);




--
-- Name: analysis analysis_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis ALTER COLUMN analysis_id SET DEFAULT nextval('public.analysis_analysis_id_seq1'::regclass);


--
-- Name: audio audio_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio ALTER COLUMN audio_id SET DEFAULT nextval('public.audio_audio_id_seq'::regclass);


--
-- Name: eaf eaf_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eaf ALTER COLUMN eaf_id SET DEFAULT nextval('public.eaf_eaf_id_seq'::regclass);


--
-- Name: image image_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image ALTER COLUMN image_id SET DEFAULT nextval('public.image_image_id_seq'::regclass);

ALTER TABLE ONLY public.collections ALTER COLUMN collection_id SET DEFAULT nextval('public.collections_collection_id_seq'::regclass);
--
-- Name: analysis analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis
    ADD CONSTRAINT analysis_pkey PRIMARY KEY (analysis_id);


--
-- Name: audio audio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio
    ADD CONSTRAINT audio_pkey PRIMARY KEY (audio_id);


--
-- Name: eaf eaf_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eaf
    ADD CONSTRAINT eaf_pkey PRIMARY KEY (eaf_id);


--
-- Name: image_analysis image_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_analysis
    ADD CONSTRAINT image_analysis_pkey PRIMARY KEY (analysis_id, image_id);


--
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (image_id);


--
-- Name: letter letter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.letter
    ADD CONSTRAINT letter_pkey PRIMARY KEY (id);


--
-- Name: recording_info recording_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recording_info
    ADD CONSTRAINT recording_info_pkey PRIMARY KEY (audio_id);


--
-- Name: user_research_language user_research_language_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_research_language
    ADD CONSTRAINT user_research_language_pkey PRIMARY KEY (user_id, user_language);


--
-- Name: user_role user_role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (user_id, user_role);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: word word_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.word
    ADD CONSTRAINT word_pkey PRIMARY KEY (id);


--
-- Name: analysis analysis_audio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis
    ADD CONSTRAINT analysis_audio_id_fkey FOREIGN KEY (audio_id) REFERENCES public.audio(audio_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audio audio_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio
    ADD CONSTRAINT audio_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: eaf eaf_audio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eaf
    ADD CONSTRAINT eaf_audio_id_fkey FOREIGN KEY (audio_id) REFERENCES public.audio(audio_id) ON DELETE CASCADE;


--
-- Name: word fk_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.word
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: letter fk_word; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.letter
    ADD CONSTRAINT fk_word FOREIGN KEY (word_id) REFERENCES public.word(id) ON DELETE CASCADE;


--
-- Name: image_analysis image_analysis_analysis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_analysis
    ADD CONSTRAINT image_analysis_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.analysis(analysis_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: image_analysis image_analysis_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_analysis
    ADD CONSTRAINT image_analysis_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(image_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: image image_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recording_info recording_info_audio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recording_info
    ADD CONSTRAINT recording_info_audio_id_fkey FOREIGN KEY (audio_id) REFERENCES public.audio(audio_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_research_language user_research_language_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_research_language
    ADD CONSTRAINT user_research_language_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_role user_role_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

