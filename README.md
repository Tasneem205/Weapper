
# Weapper 🌤️

Weather API wrapper service is a lightweight Weather API wrapper built with Node.js that speeds up response times and reduces third-party API calls using dual-layer caching with Redis and MongoDB. built as ALX backend specialization graduation project.

Documentation published on postman: <https://documenter.getpostman.com/view/23533384/2sAYQgg8Th>

## Why Weapper?

When relying on external third-party APIs (like weather services), backend systems face two main bottlenecks:

1. **High Latency:** Fetching data across the network on every request introduces unnecessary delay.
2. **Rate Limits:** Downstream APIs impose strict request quotas that can easily be exhausted under high traffic.

Weapper solves this by serving as an intelligent middleware caching layer. It intercept requests, checks an in-memory Redis cache first, falls back to MongoDB, and only queries the external API when data is stale or missing.
