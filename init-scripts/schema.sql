CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL PRIMARY KEY,
    full_name  VARCHAR(100) NOT NULL,
    phone      VARCHAR(20)  NOT NULL UNIQUE,
    province   VARCHAR(100) NOT NULL,
    region     VARCHAR(10)  NOT NULL,
    created_at TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
    id           BIGSERIAL PRIMARY KEY,
    full_name    VARCHAR(100) NOT NULL,
    phone        VARCHAR(20)  NOT NULL UNIQUE,
    province     VARCHAR(100) NOT NULL,
    region       VARCHAR(10)  NOT NULL,
    is_available BOOLEAN      DEFAULT TRUE,
    created_at   TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rides (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users(id),
    driver_id  BIGINT       REFERENCES drivers(id),
    pickup     VARCHAR(200) NOT NULL,
    dropoff    VARCHAR(200) NOT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    region     VARCHAR(10)  NOT NULL,
    created_at TIMESTAMP    DEFAULT NOW()
);
