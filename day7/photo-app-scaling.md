# SnapShare Scaling Plan

## Assumptions

- SnapShare has 10,000,000 registered users.
- 10% of registered users are active on a typical day, so there are 1,000,000 daily active users (DAU).
- Each daily active user uploads one photo and views 50 feed pages per day.
- Each original photo is 2 MB and each generated thumbnail is 50 KB. These are decimal units (1 MB = 1,000,000 bytes).
- A day is approximately 100,000 seconds for easy estimates, and peak traffic is five times average traffic.
- Each feed page is one read request for this estimate; the feed's metadata is stored in the database, while photo files are stored separately.
- For storage estimates, assume photos and thumbnails are retained for a year, without compression or deletion. This estimates one year of new data, before replication or backups.

## Load and storage estimates

**Daily active users:**

10,000,000 registered users × 10% active = **1,000,000 DAU**

**Uploads:**

1,000,000 DAU × 1 upload/day = 1,000,000 uploads/day

1,000,000 ÷ 100,000 ≈ **10 uploads per second on average**

At 5× peak, uploads are approximately **50 per second**.

**Feed views:**

1,000,000 DAU × 50 feed pages/day = 50,000,000 feed views/day

50,000,000 ÷ 100,000 ≈ **500 feed views per second on average**

At 5× peak, feed views are approximately **2,500 per second**.

**Photo storage per year:**

1,000,000 photos/day × 2 MB = 2,000,000 MB/day = **2 TB/day**

2 TB/day × 365 ≈ **730 TB/year of original photos**.

Thumbnails add 1,000,000 × 50 KB = 50 GB/day, or about **18.25 TB/year**. Together, originals and thumbnails need about **748 TB/year**, before backups, replication, or storage overhead.

SnapShare is **read-heavy**: it serves about 50 feed views for every photo upload. The design should cache frequently requested feed data and use read replicas for database reads, while keeping writes directed to the primary database. The CDN and object storage serve the large photo files so they do not overwhelm the app servers or database.

## Architecture

```text
                         ┌────────────────────┐
                         │ DNS: snapshare.com │
                         └─────────┬──────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │                                         │
              v                                         v
   ┌─────────────────────┐                  ┌──────────────────────┐
   │ Browser / mobile app│── static files ─>│ CDN                  │
   └──────────┬──────────┘                  │ (images, CSS, JS,    │
              │                             │ photo delivery)      │
              │ API requests                └──────────▲───────────┘
              v                                         │ photos and
   ┌──────────────────┐                                │ thumbnails
   │ Load balancer    │                                │
   └────────┬─────────┘                                │
            │                                          │
       ┌────┴─────┐                                    │
       v          v                                    │
   ┌────────┐  ┌────────┐       ┌──────────────┐       │
   │ App 1  │  │ App 2  │──────>│ Cache        │       │
   │        │  │        │<──────│ (feed data)  │       │
   └───┬────┘  └───┬────┘       └──────────────┘       │
       │            │                                   │
       │ writes     │ feed reads                        │
       v            v                                   │
   ┌─────────┐  ┌──────────────┐                         │
   │ Primary │─>│ Read replica │                         │
   │ DB      │  │              │                         │
   └─────────┘  └──────────────┘                         │
       │                                                 │
       │ job: create thumbnail                           │
       v                                                 │
   ┌─────────────┐      ┌──────────┐      ┌──────────────┴──┐
   │ Message     │─────>│ Worker   │─────>│ Object storage │
   │ queue       │      │ thumbnail│      │ originals +   │
   └─────────────┘      └──────────┘      │ thumbnails     │
                                          └─────────────────┘
```

## What each component solves

- **DNS** translates `snapshare.com` into the address the client needs to reach SnapShare.
- **CDN** serves static assets and cached photos from locations close to users, reducing latency and origin traffic.
- **Load balancer** distributes API requests across healthy app servers and stops routing to unhealthy ones.
- **App servers** run the API and business logic; multiple stateless instances share work and can be added as traffic grows.
- **Cache** keeps frequently requested feed data in memory to reduce response time and database reads.
- **Primary database** stores authoritative account, follow, and photo metadata and accepts writes.
- **Read replica** serves feed and other read queries, reducing read pressure on the primary database.
- **Object storage** holds original photos and thumbnails as files, keeping large binary data out of the relational database.
- **Message queue** buffers thumbnail jobs so photo uploads can finish without waiting for image processing.
- **Thumbnail worker** processes queued jobs and creates smaller images for efficient feed and device delivery.

## Why photo files belong in object storage

The database should store metadata such as the photo ID, owner, caption, upload time, and object-storage key. Photo files are large binary objects; keeping them in a database would make database backups, replication, and queries heavier and more expensive. Object storage is designed to store and retrieve files at this scale, and the CDN can cache those files close to viewers.

## Photo upload flow

1. The client sends an authenticated request to the API through the load balancer to begin an upload.
2. An app server validates the request, creates a photo ID and object-storage key, and returns a short-lived upload URL (or equivalent upload credentials) to the client.
3. The client uploads the original photo directly to object storage, avoiding routing the large file through an app server.
4. The client tells the API the upload is complete. The app server verifies the object exists, writes the photo metadata to the primary database, and invalidates affected feed-cache entries.
5. The app server places a thumbnail-generation job on the message queue and responds that the photo was accepted.
6. A worker takes the job, reads the original from object storage, creates a 50 KB thumbnail, and saves it back to object storage under its thumbnail key.
7. The app records or updates the thumbnail key/status in the database. The CDN can then serve the original and thumbnail to viewers; until the thumbnail is ready, the feed can show a placeholder or the original.

## Trade-offs

- **Fast feed versus fresh feed:** cache entries and read replicas reduce latency and database load, but a newly uploaded photo may take a short time to appear everywhere because of cache invalidation and replication lag.
- **Direct uploads versus simpler server handling:** uploading directly to object storage avoids pushing large files through app servers, but it requires signed upload URLs and a completion/verification step.
- **Async thumbnailing versus immediate previews:** a queue keeps upload responses fast and smooths bursts of work, but thumbnails are not available immediately and the system must handle failed or retried jobs.
- **More availability versus more cost and operations:** multiple app servers, replicas, object-storage redundancy, and CDN delivery improve resilience and capacity, but increase infrastructure costs and operational complexity.
