.PHONY: build run test clean swagger migrate-up migrate-down


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
