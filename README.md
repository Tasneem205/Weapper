
# Weapper 🌤️

Weather API wrapper service is a lightweight Weather API wrapper built with Node.js that speeds up response times and reduces third-party API calls using dual-layer caching with Redis and MongoDB. built as ALX backend specialization graduation project.

Documentation published on postman: <https://documenter.getpostman.com/view/23533384/2sAYQgg8Th>

## Why Weapper?

When relying on external third-party APIs (like weather services), backend systems face two main bottlenecks:

1. **High Latency:** Fetching data across the network on every request introduces unnecessary delay.
2. **Rate Limits:** Downstream APIs impose strict request quotas that can easily be exhausted under high traffic.

Weapper solves this by serving as an intelligent middleware caching layer. It intercept requests, checks an in-memory Redis cache first, falls back to MongoDB, and only queries the external API when data is stale or missing.

## Interactive Demo & Documentation

Explore and test the **Weapper** API endpoints directly using either our interactive web application or complete Postman collection.

* **Live API Playground (GitHub Pages):** [Try it live](https://Tasneem205.github.io/weapper)  
  *An interactive frontend built with HTML, CSS, and JavaScript allowing you to send live requests to the deployed API, inspect responses, and observe cache layer flags (`redis-cache`, `mongo-fallback`, or `external-api`) in real time.*

* **Complete Postman Documentation:** [View Documentation](https://documenter.getpostman.com/view/23533384/2sAYQgg8Th)  
  *Detailed endpoint specifications, query parameters,and sample response payloads from a local development environment.*

---

### Caching Mechanism Overview

| Cache Source Flag | Origin | Typical Response Time |
| :--- | :--- | :--- |
| **`redis-cache`** | In-memory cache hit via Upstash Redis | **~10ms – 20ms** |
| **`mongo-fallback`** | Secondary persistent storage hit via MongoDB | **~50ms – 80ms** |
| **`external-api`** | Live third-party API fetch (OpenWeather / Visual Crossing) | **~300ms+** |

## How to Install

Follow these steps to set up and run Weapper locally.

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB instance)
- An [Upstash Redis](https://upstash.com/) database (or local Redis server)

---

### Installation & Local Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Tasneem205/Weapper.git
   cd weapper
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**  
   Create a `.env` file in the root directory using the `.env.example` template:

   ```bash
   cp .env.example .env
   ```

   Fill in your actual API keys, database connection string, and Redis credentials inside `.env`.

4. **Start the development server:**

   ```bash
   npm run start-dev
   ```

The server should now be running locally at `http://localhost:4040`.
