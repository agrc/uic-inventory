CREATE TYPE access_level AS ENUM ('elevated', 'standard');

CREATE TABLE public.accounts (
    id integer NOT NULL,
    utah_id character varying(128) UNIQUE,
    email character varying(512),
    first_name character varying(128),
    last_name character varying(128),
    account_access access_level DEFAULT 'standard'
);

ALTER TABLE public.accounts OWNER TO postgres;

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.accounts_id_seq OWNER TO postgres;

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);
