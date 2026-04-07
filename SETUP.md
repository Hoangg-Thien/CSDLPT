# Huong dan setup Ride App (Database Replication + Spring Boot)

Tai lieu nay huong dan setup full tu dau den cuoi cho project, gom:

- Docker PostgreSQL 4 node (South Primary/Replica, North Primary/Replica)
- Streaming Replication cho 2 cum South va North
- Seed du lieu mau
- Chay Spring Boot
- Checklist commit va push len GitHub

## 1) Yeu cau moi truong

Can cai dat:

- Docker Desktop (co Docker Compose v2)
- Java 21
- Maven Wrapper (da co san trong project: mvnw, mvnw.cmd)
- Git

Kiem tra nhanh:

- docker --version
- docker compose version
- java -version
- git --version

## 2) Cau truc file quan trong

- docker-compose.yml: Dinh nghia 4 service Postgres va replication
- init-scripts/01-setup-replication.sql: Tao user replicator
- init-scripts/pg_hba.conf: Cho phep ket noi replication trong lab local
- init-scripts/schema.sql: Tao bang users, drivers, rides
- init-scripts/seed_south.sql: Seed du lieu South (12 rides)
- init-scripts/seed_north.sql: Seed du lieu North (12 rides)
- scripts/bootstrap-replica.sh: Bootstrap replica bang pg_basebackup
- src/main/resources/application.yaml: Cau hinh datasource + app regions

## 3) Ports dang su dung

Mac dinh hien tai:

- South Primary: localhost:5436
- South Replica: localhost:5437
- North Primary: localhost:5438
- North Replica: localhost:5439
- Spring Boot: localhost:8080

## 4) Setup database replication

Quan trong: Moi lan thay doi init-scripts hoac replication config, nen reset volume de init lai.

### Buoc 1: Dung va xoa data cu (neu co)

- docker compose down -v

### Buoc 2: Khoi dong lai stack

- docker compose up -d

### Buoc 3: Kiem tra service

- docker compose ps

Ky vong: 4 container deu Up, primary healthy, replica running.

## 5) Verify replication

### Kiem tra tren South primary

- docker exec pg-south-primary psql -U admin -d rideapp -c "SELECT application_name, client_addr, state, sync_state FROM pg_stat_replication;"

Ky vong: co 1 dong state=streaming.

### Kiem tra tren North primary

- docker exec pg-north-primary psql -U admin -d rideapp -c "SELECT application_name, client_addr, state, sync_state FROM pg_stat_replication;"

Ky vong: co 1 dong state=streaming.

### Kiem tra seed du lieu

- docker exec pg-south-primary psql -U admin -d rideapp -c "SELECT region, COUNT(\*) AS ride_count FROM rides GROUP BY region ORDER BY region;"
- docker exec pg-north-primary psql -U admin -d rideapp -c "SELECT region, COUNT(\*) AS ride_count FROM rides GROUP BY region ORDER BY region;"

Ky vong:

- South co 12 rides
- North co 12 rides

### Test dong bo du lieu Primary -> Replica

South:

- docker exec pg-south-primary psql -U admin -d rideapp -c "INSERT INTO rides (user_id, driver_id, pickup, dropoff, status, region) VALUES (1, 1, 'Replica Test Pickup', 'Replica Test Dropoff', 'COMPLETED', 'SOUTH');"
- docker exec pg-south-replica psql -U admin -d rideapp -c "SELECT COUNT(\*) FROM rides WHERE pickup='Replica Test Pickup';"

North:

- docker exec pg-north-primary psql -U admin -d rideapp -c "INSERT INTO rides (user_id, driver_id, pickup, dropoff, status, region) VALUES (1, 1, 'North Replica Test Pickup', 'North Replica Test Dropoff', 'COMPLETED', 'NORTH');"
- docker exec pg-north-replica psql -U admin -d rideapp -c "SELECT COUNT(\*) FROM rides WHERE pickup='North Replica Test Pickup';"

Ky vong: replica tra ve COUNT = 1.

## 6) Chay Spring Boot

Sau khi DB da san sang:

- .\mvnw.cmd spring-boot:run

App se chay tai:

- http://localhost:8080

Neu can dung app: Ctrl + C.

## 7) Luu y ve Flyway

Project su dung Flyway migration trong src/main/resources/db/migration.
Ten file can theo convention:

- V1\_\_schema.sql
- V2\_\_seed_data.sql

Neu dat sai ten, Flyway se bo qua migration.

## 8) Troubleshooting nhanh

Neu replica restart lien tuc:

- Xem logs: docker compose logs --tail=200 pg-south-replica pg-north-replica
- Thu reset lai toan bo:
  - docker compose down -v
  - docker compose up -d

Neu app khong connect DB:

- Kiem tra container da up: docker compose ps
- Kiem tra port 5436 dang nghe
- Kiem tra application.yaml datasource URL

Neu gap loi Flyway "Found non-empty schema(s) ... but no schema history table":

- Nguyen nhan: DB da duoc tao/seed san tu init-scripts, nhung chua co bang flyway_schema_history.
- Da cau hinh san trong application.yaml:
  - spring.flyway.baseline-on-migrate=true
  - spring.flyway.baseline-version=2
- Chay lai app:
  - .\mvnw.cmd spring-boot:run

Neu can doi port theo yeu cau bao cao (vd 5432-5435):

- Sua dong bo trong docker-compose.yml va application.yaml
- Reset lai stack: docker compose down -v; docker compose up -d
