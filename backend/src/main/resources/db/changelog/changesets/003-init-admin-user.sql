--liquibase formatted SQL

--changeset pmichalczewski:003-init-admin-user
INSERT INTO users(id, username, password_hash, created_at)
VALUES(gen_random_uuid(), 'admin', '${PASS_HASH}', CURRENT_TIMESTAMP);

--rollback DELETE FROM users WHERE username = 'admin';