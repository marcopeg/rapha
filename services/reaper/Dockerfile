#
# Build Production Artifacts
# ==========================================
#
# this first step takes in the source files and build the artifacts
# (basicall all that need to be transpiled).
#
# We do install the NPM dependencies twice so to copy over to the
# production image only what is strictly needed to execute our app.
# 
# NPM Install is the first step so to exploit Docker's cache mechanism
# and speed up the building process. We will re-install from NPM only
# if we touch the `package.json` file. Which doesn't happen so often.
#

FROM node:10.14-alpine AS builder

# NPM Install for building
WORKDIR /usr/src/app-build
ADD package.json /usr/src/app-build/package.json
RUN yarn install

# NPM Install for production
WORKDIR /usr/src/app-run
ADD package.json /usr/src/app-run/package.json
RUN cp /usr/src/app-build/yarn.lock ./
RUN yarn install --production=true

# Copy source files:
WORKDIR /usr/src/app-build
ADD index.js /usr/src/app-build
ADD index.dev.js /usr/src/app-build
ADD .babelrc /usr/src/app-build
ADD .babelrc /usr/src/app-build
ADD .env /usr/src/app-build
ADD .eslintrc /usr/src/app-build
ADD .eslintignore /usr/src/app-build

# Build backend
WORKDIR /usr/src/app-build
ADD ssr /usr/src/app-build/ssr
RUN npm run build









#
# Runner Image
# ==========================================
#
# in this step we start over with a fresh image and copy only what is
# strictly necessary in order to run a production build.
#
# the idea is to keep this image as small as possible.
#

FROM node:10.14-alpine AS runner

# Copy assets for build:
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app-run/node_modules ./node_modules
# COPY --from=builder /usr/src/app-build/build ./build
# COPY --from=builder /usr/src/app-build/build-src ./build-src
COPY --from=builder /usr/src/app-build/build-ssr ./build-ssr
ADD package.json /usr/src/app
ADD index.js /usr/src/app








#
# Install Docker to get the logs out of the shit
# -- This is needed only for MacOSX pourpose --
#

RUN apk add --no-cache \
		ca-certificates

# set up nsswitch.conf for Go's "netgo" implementation (which Docker explicitly uses)
# - https://github.com/docker/docker-ce/blob/v17.09.0-ce/components/engine/hack/make.sh#L149
# - https://github.com/golang/go/blob/go1.9.1/src/net/conf.go#L194-L275
# - docker run --rm debian:stretch grep '^hosts:' /etc/nsswitch.conf
RUN [ ! -e /etc/nsswitch.conf ] && echo 'hosts: files dns' > /etc/nsswitch.conf

ENV DOCKER_CHANNEL stable
ENV DOCKER_VERSION 18.09.1
# TODO ENV DOCKER_SHA256
# https://github.com/docker/docker-ce/blob/5b073ee2cf564edee5adca05eee574142f7627bb/components/packaging/static/hash_files !!
# (no SHA file artifacts on download.docker.com yet as of 2017-06-07 though)

RUN set -eux; \
	\
# this "case" statement is generated via "update.sh"
	apkArch="$(apk --print-arch)"; \
	case "$apkArch" in \
		x86_64) dockerArch='x86_64' ;; \
		armhf) dockerArch='armel' ;; \
		aarch64) dockerArch='aarch64' ;; \
		ppc64le) dockerArch='ppc64le' ;; \
		s390x) dockerArch='s390x' ;; \
		*) echo >&2 "error: unsupported architecture ($apkArch)"; exit 1 ;;\
	esac; \
	\
	if ! wget -O docker.tgz "https://download.docker.com/linux/static/${DOCKER_CHANNEL}/${dockerArch}/docker-${DOCKER_VERSION}.tgz"; then \
		echo >&2 "error: failed to download 'docker-${DOCKER_VERSION}' from '${DOCKER_CHANNEL}' for '${dockerArch}'"; \
		exit 1; \
	fi; \
	\
	tar --extract \
		--file docker.tgz \
		--strip-components 1 \
		--directory /usr/local/bin/ \
	; \
	rm docker.tgz; \
	\
	dockerd --version; \
	docker --version






#
# Startup Info
# ==========================================
#

# ENV BABEL_ENV node
ENV NODE_ENV production
ENV LOG_LEVEL error

ENTRYPOINT [ "node", "index.js" ]
