-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" BIGINT NOT NULL,
    "blockchain_address" TEXT,
    "organizer_wallet" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "venue_id" TEXT NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "total_tickets" INTEGER NOT NULL,
    "tickets_sold" INTEGER NOT NULL DEFAULT 0,
    "tickets_used" INTEGER NOT NULL DEFAULT 0,
    "tickets_burned" INTEGER NOT NULL DEFAULT 0,
    "general_price" BIGINT NOT NULL,
    "vip_price" BIGINT NOT NULL,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "transferable" BOOLEAN NOT NULL DEFAULT true,
    "transfer_freeze_time" DATETIME,
    "metadata" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "capacity" INTEGER NOT NULL,
    "venue_type" TEXT NOT NULL,
    "amenities" TEXT NOT NULL DEFAULT '',
    "owner_wallet" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ticket_tiers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "total_supply" INTEGER NOT NULL,
    "minted_count" INTEGER NOT NULL DEFAULT 0,
    "dynamic_pricing" BOOLEAN NOT NULL DEFAULT false,
    "min_price" BIGINT,
    "max_price" BIGINT,
    "metadata" TEXT,
    CONSTRAINT "ticket_tiers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "events_event_id_key" ON "events"("event_id");

-- CreateIndex
CREATE INDEX "events_organizer_wallet_idx" ON "events"("organizer_wallet");

-- CreateIndex
CREATE INDEX "events_venue_id_idx" ON "events"("venue_id");

-- CreateIndex
CREATE INDEX "events_start_time_idx" ON "events"("start_time");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "venues_owner_wallet_idx" ON "venues"("owner_wallet");

-- CreateIndex
CREATE INDEX "venues_city_state_idx" ON "venues"("city", "state");
