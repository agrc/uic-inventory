-- Custom Types
CREATE TYPE public.access_level AS ENUM ('elevated', 'standard');

CREATE TYPE public.notification_types AS ENUM ('new_user_account_registration', 'facility_contact_modified');

CREATE TYPE public.contact_types AS ENUM ('owner_operator', 'facility_owner', 'facility_operator', 'facility_manager', 'legal_rep', 'official_rep', 'contractor', 'health_dept', 'permit_writer', 'developer', 'other', 'project_manager');

-- Account
DROP TABLE IF EXISTS public.accounts;

CREATE TABLE public.accounts (
  id serial NOT NULL,
  utah_id varchar(128) UNIQUE NOT NULL,
  first_name varchar(128) NOT NULL,
  last_name varchar(128) NOT NULL,
  organization varchar(512),
  email varchar(512),
  phone varchar(64),
  mailing_address varchar(512),
  city varchar(128),
  state varchar(128),
  zip_code varchar(64),
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

ALTER TABLE public.accounts OWNER TO postgres;

GRANT ALL ON TABLE public.accounts TO postgres;

-- Notifications

DROP TABLE IF EXISTS public.notifications;

CREATE TABLE public.notifications (
  id serial NOT NULL,
  notification_type notification_types NULL,
  created_at TIMESTAMP NOT NULL,
  url varchar(512),
  additional_data jsonb,
  CONSTRAINT notification_primary_key PRIMARY KEY (id)
);

ALTER TABLE public.notifications ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.notifications OWNER TO postgres;

GRANT ALL ON TABLE public.notifications TO postgres;

DROP TABLE IF EXISTS public.notification_receipts;

CREATE TABLE public.notification_receipts (
  id serial NOT NULL,
  read_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  recipient_id integer NULL,
  notification_fk integer NOT NULL,
  CONSTRAINT notification_receipt_primary_key PRIMARY KEY (id),
  CONSTRAINT notification_receipt_fk FOREIGN KEY (notification_fk) REFERENCES public.notifications(id),
  CONSTRAINT accounts_fk FOREIGN KEY (recipient_id) REFERENCES public.accounts(id)
);

ALTER TABLE public.notification_receipts OWNER TO postgres;

GRANT ALL ON TABLE public.notification_receipts TO postgres;

-- Sites

DROP TABLE IF EXISTS public.sites;

CREATE TABLE public.sites (
  id serial NOT NULL,
  name varchar(128) NOT NULL,
  ownership varchar(2) NOT NULL,
  naics_primary integer NOT NULL,
  naics_title varchar(128) NOT NULL,
  activity varchar(512) NOT NULL,
  account_fk integer NOT NULL,

  CONSTRAINT site_primary_key PRIMARY KEY (id),
  CONSTRAINT site_to_account_fk FOREIGN KEY (account_fk) REFERENCES public.accounts(id)
);

ALTER TABLE public.sites OWNER TO postgres;

GRANT ALL ON TABLE public.sites TO postgres;

-- Contacts

CREATE TABLE public.contacts (
  id serial NOT NULL,
  first_name varchar(128) NOT NULL,
  last_name varchar(128) NOT NULL,
  organization varchar(512),
  email varchar(512),
  phone varchar(64),
  mailing_address varchar(512),
  city varchar(128),
  state varchar(128),
  zip_code varchar(64),
  contact_type contact_types DEFAULT 'other' :: contact_types,
  site_fk integer NOT NULL,
  CONSTRAINT contacts_primary_key PRIMARY KEY (id),
  CONSTRAINT contact_to_site_fk FOREIGN KEY (site_fk) REFERENCES public.sites(id)
);

ALTER TABLE public.contacts OWNER TO postgres;

GRANT ALL ON TABLE public.contacts TO postgres;
