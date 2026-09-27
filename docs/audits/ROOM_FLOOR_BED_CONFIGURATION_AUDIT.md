# Physical Infrastructure Audit & Hardening Report

## Overview
This document summarizes the changes made to harden the existing Swarnika Care Physical Infrastructure module (Rooms, Beds, Floors) before locking the domain.

## Changes Made

### 1. Room Status Lifecycle
- Introduced `RoomStatus` enum: `AVAILABLE`, `OCCUPIED`, `CLEANING`, `MAINTENANCE`, `BLOCKED`, `INACTIVE`.
- Updated `Room` entity and `RoomRequest` DTO to use `RoomStatus` instead of a plain String.
- Implemented state machine transitions in `RoomService.updateStatus()` enforcing valid transitions.
- Added `PATCH /api/v1/rooms/{id}/status` endpoint to `RoomController` to allow backend-authorized status mutations.

### 2. Room Capacity Enforcement
- Updated `BedService.create()` to atomically check the number of existing beds in the room against `room.capacity`. If the limit is reached, it throws an `IllegalArgumentException`.
- Updated `RoomService.update()` to block reduction of room capacity below the current number of existing beds.
- Added a Hibernate `@Formula` to `Room.java` to compute `bedCount` natively on the backend, allowing the frontend to easily display `Capacity / Beds` (e.g. `2 / 1`).

### 3. Floor-Level Room Query
- Added `findByFloorId(Long floorId)` to `RoomRepository`.
- Added `findAllByFloor(Long floorId)` to `RoomService`.
- Extended `GET /api/v1/rooms` in `RoomController` to support `@RequestParam(required = false) Long floorId`, respecting the hospital access scope.

### 4. Database Migration
- Created Flyway migration `V7__update_room_status.sql` to safely map legacy string statuses (`'ACTIVE'`) to the new enum value (`'AVAILABLE'`).

### 5. Frontend Enhancements (UI Corrections)
- Extended `/admin/infrastructure/page.tsx` to support the new `bedCount` derived field in the `Room` card/table.
- Displayed `Capacity / Beds` side-by-side in the Rooms table, highlighting in red if `bedCount >= capacity`.
- Enforced UI-level blocking of "Add Bed" if the selected room has reached its capacity.
- Integrated a "Change Room Status" modal parallel to the existing Bed Status modal, respecting the new backend `ROOM_STATUSES`.

## Status & Conclusion
- **Tests**: `mvn clean package` passes 100% of existing tests.
- **Security**: Endpoint authorization correctly scoped (`@PreAuthorize` with `ScopeValidator`).
- **Parity**: Database schema, DTOs, and frontend state are in perfect alignment.

### **INFRASTRUCTURE IS NOW LOCKED.** 
No further development is to be performed on `/admin/infrastructure`. Moving forward to operational portals (Admin V1 Dashboards, Doctor, Receptionist, Patient, Nurse).
