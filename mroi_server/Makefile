docker_build:
	@docker build \
		-t ai_cloud_service:$(version) .

docker_push:
	@docker push ai_cloud_service:$(version)

bp: docker_build docker_push

staging:
	@export IMAGE_VERSION=$(version) && \
		docker-compose down && \
		docker-compose build --pull --no-cache && \
		docker-compose \
			-f docker-compose.yml \
			-f docker-compose.staging.yml \
		up -d --remove-orphans

dev:
	@export IMAGE_VERSION=$(version) && \
		docker-compose down && \
		docker-compose build --pull --no-cache && \
		docker-compose \
			-f docker-compose.yml \
			-f docker-compose.dev.yml \
		up -d --remove-orphans

production:
	@export IMAGE_VERSION=$(version) && \
		docker-compose down && \
		docker-compose build --pull --no-cache && \
		docker-compose \
			-f docker-compose.yml \
			-f docker-compose.production.yml \
		up -d --remove-orphans
