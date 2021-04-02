FROM postgres:13

COPY ./data/*.sql /docker-entrypoint-initdb.d/
