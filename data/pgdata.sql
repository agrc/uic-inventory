CREATE TYPE public.access_level AS ENUM ('elevated', 'standard');

CREATE TYPE public.notification_types AS ENUM ('new_user_account_registration', 'facility_contact_modified');

CREATE TABLE public.accounts (
  id serial NOT NULL,
  utah_id character NOT NULL varying(128) UNIQUE,
  first_name character NOT NULL varying(128),
  last_name character NOT NULL varying(128),
  organization character varying(512),
  email character varying(512),
  phone character varying(64),
  mailing_address character varying(512),
  city character varying(128),
  state character varying(128),
  zip_code character varying(64),
  receive_notifications boolean NOT NULL DEFAULT FALSE,
  account_access access_level NOT NULL DEFAULT 'standard' :: access_level,
  complete_profile boolean GENERATED ALWAYS AS (CASE WHEN
    LENGTH(organization) > 0 AND
    LENGTH(email) > 0 AND
    LENGTH(phone) > 0 AND
    LENGTH(mailing_address) > 0 AND
    LENGTH(city) > 0 AND
    LENGTH(state) > 0 AND
    LENGTH(zip_code) > 0
    THEN true ELSE false END) STORED,
  CONSTRAINT account_primary_key PRIMARY KEY (id),
  CONSTRAINT account_utah_id_key UNIQUE (utah_id)
);

DROP TABLE IF EXISTS public.notifications;

CREATE TABLE public.notifications (
  id serial NOT NULL,
  notification_type notification_types NULL,
  created_at TIMESTAMP NOT NULL DEFAFULT now(),
  url character varying(512),
  additional_data jsonb,
  CONSTRAINT notification_primary_key PRIMARY KEY (id)
);

DROP TABLE IF EXISTS public.notification_receipts;

CREATE TABLE public.notification_receipts (
  id serial NOT NULL,
  read_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  recipient_id integer NULL,
  notification_fk integer NOT NULL,
  CONSTRAINT notification_receipt_primary_key PRIMARY KEY (id),
  CONSTRAINT notification_receipt_fk FOREIGN KEY (notification_fk) REFERENCES public.notifications(id)
  CONSTRAINT accounts_fk FOREIGN KEY (recipient_id) REFERENCES public.accounts(id)
);

ALTER TABLE
  public.accounts OWNER TO postgres;

ALTER TABLE
  public.notifications OWNER TO postgres;

ALTER TABLE
  public.notification_receipts OWNER TO postgres;

GRANT ALL ON TABLE public.accounts TO postgres;

GRANT ALL ON TABLE public.notifications TO postgres;

GRANT ALL ON TABLE public.notification_receipts TO postgres;
