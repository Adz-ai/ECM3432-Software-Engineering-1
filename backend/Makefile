.PHONY: build run test clean swagger migrate-up migrate-down install-tools coverage


ifneq (,$(wildcard ./.env))
    include .env
    export
endif


# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GORUN=$(GOCMD) run
GOTEST=$(GOCMD) test
GOMOD=$(GOCMD) mod
BINARY_NAME=chalkstone-council-api
MAIN_PATH=cmd/api/main.go

build:
	$(GOBUILD) -o $(BINARY_NAME) $(MAIN_PATH)

run:
	$(GORUN) $(MAIN_PATH)

test:
	$(GOTEST) -v ./...

coverage:
	go test -coverprofile=coverage.raw.out ./... && \
	cat coverage.raw.out | grep -v "/cmd/" | grep -v "/mocks/" | grep -v "/docs/" > coverage.out && \
	go tool cover -html=coverage.out -o coverage.html && \
	go tool cover -func=coverage.out | grep -vE 'mocks|migrations|config|docs|logging|main|cmd|storage/storage.go' | tee coverage_summary.txt && \
	AVG_CORE_COV=$$(go tool cover -func=coverage.out | grep -vE 'cmd|mocks|migrations|config|docs|logging|main|storage/storage.go' | grep total | awk '{print $$3}'); \
	echo "📊 Coverage report generated! Open coverage.html in your browser." && \
	echo "📈 Core Code Coverage: $${AVG_CORE_COV}" && \
	AVG_TOTAL_COV=$$(go tool cover -func=coverage.out | grep total | awk '{print $$3}'); \
	echo "📊 Total Project Coverage (including excluded code): $${AVG_TOTAL_COV}"

clean:
	rm -f $(BINARY_NAME)
	rm -rf docs/

deps:
	$(GOMOD) download
	$(GOMOD) tidy

swagger:
	swag init -g $(MAIN_PATH) --output docs

migrate-up:
	migrate -database "postgresql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=disable" -path migrations up

migrate-down:
	migrate -database "postgresql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=disable" -path migrations down

dev: swagger
	air -c .air.toml

install-tools:
	go install github.com/swaggo/swag/cmd/swag@latest
	go install github.com/air-verse/air@latest
	go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	go install go.uber.org/mock/mockgen@latest
	go get github.com/testcontainers/testcontainers-go

.PHONY: docker-env-file
docker-env-file:
	touch .env
	echo "DB_HOST=postgres" >> .env
	echo "DB_PORT=5432" >> .env
	echo "DB_USER=chalkstone" >> .env
	echo "DB_PASSWORD=chalkstone_password" >> .env
	echo "DB_NAME=chalkstone" >> .env
	echo "PORT=8080" >> .env
	echo "JWT_SECRET=y35ada99f2f118c2cde7cf397a04f320682ad41f0abca7ce735ddf7ef1fdcf7eb15d2cc62a3f15bf1d6824402bb8bf7c3cba7be1bccb392ff2ffd25ffbc227b7777063f5781e05ab6ec39ec770a740a2286009a209f485fae6e20d937307668740fd48dd746b28274e633bc479633ad154bce920db645b5d771023691c1b1b4103729ffcdca860ebbe2910c1f2c65a1f2e01e07d9a0218f0ea9fc9f98ed84b5fbcd30219c67698bb4224e72f2bb7789687d095fbbf164f5f0aab710a1dcec039bbfac7d7ec7e74cdebe99409e53f0ffae7622dd0ae7bd2836508f233a9efcc0ae793e5a90a8401f9614d6e6b839057ab3290489fa67db5fda664a49e128177662" >> .env
	echo "MINIO_ENDPOINT=minio:9000" >> .env
	echo "MINIO_ACCESS_KEY=minioadmin" >> .env
	echo "MINIO_SECRET_KEY=minioadmin" >> .env
	echo "MINIO_BUCKET=issues-bucket" >> .env
	echo "GIN_MODE=release" >> .env


