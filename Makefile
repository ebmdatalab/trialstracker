export DOCKER_BUILDKIT=1

build:
	docker build . -t trialstracker


test:
	cd app/js && npm ci && npm run test
