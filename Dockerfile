version: '3.8'
services:
  eduworld-backend:
    container_name: iris
    build:
      context: .
      dockerfile: Dockerfile
    image: ${DOCKER_USERNAME}/iris:latest
    restart: always
    ports:
      - "8080:8080"
    env_file:
      - ./frontend/.env  # This line specifies to use the .env file from the backend directory
  #    - ./.env 
    environment:
      - NODE_ENV=production
    volumes:
      - ./frontend:/usr/src/app
      - /usr/src/app/node_modules
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
