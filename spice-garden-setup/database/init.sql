-- Run this as a PostgreSQL superuser (for example, postgres).
-- Change the password before using this outside local development.

CREATE USER spice_garden_user WITH PASSWORD 'change-this-password';
CREATE DATABASE spice_garden OWNER spice_garden_user;

\connect spice_garden
GRANT ALL ON SCHEMA public TO spice_garden_user;
ALTER ROLE spice_garden_user WITH PASSWORD 'change-this-password';