import { 
  users, owners, parkingSlots, bookings, notifications,
  type User, type InsertUser, type Owner, type InsertOwner,
  type ParkingSlot, type InsertParkingSlot, type Booking, type InsertBooking,
  type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<User>;

  // Owner operations
  getOwner(id: string): Promise<Owner | undefined>;
  getOwnerByUserId(userId: string): Promise<Owner | undefined>;
  createOwner(owner: InsertOwner): Promise<Owner>;
  updateOwnerStatus(id: string, status: "approved" | "rejected"): Promise<Owner>;
  getPendingOwners(): Promise<Owner[]>;

  // Parking slot operations
  getParkingSlot(id: string): Promise<ParkingSlot | undefined>;
  getAvailableSlots(city?: string, vehicleType?: string): Promise<ParkingSlot[]>;
  getSlotsByOwner(ownerId: string): Promise<ParkingSlot[]>;
  createParkingSlot(slot: InsertParkingSlot): Promise<ParkingSlot>;
  updateSlotAvailability(id: string, isAvailable: boolean): Promise<ParkingSlot>;

  // Booking operations
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByOwner(ownerId: string): Promise<Booking[]>;
  getPendingBookingsForOwner(ownerId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string, paymentIntentId?: string): Promise<Booking>;

  // Notification operations
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;

  // Analytics
  getSystemStats(): Promise<{
    totalUsers: number;
    totalOwners: number;
    activeBookings: number;
    monthlyRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getOwner(id: string): Promise<Owner | undefined> {
    const [owner] = await db.select().from(owners).where(eq(owners.id, id));
    return owner || undefined;
  }

  async getOwnerByUserId(userId: string): Promise<Owner | undefined> {
    const [owner] = await db.select().from(owners).where(eq(owners.userId, userId));
    return owner || undefined;
  }

  async createOwner(insertOwner: InsertOwner): Promise<Owner> {
    const [owner] = await db.insert(owners).values(insertOwner).returning();
    return owner;
  }

  async updateOwnerStatus(id: string, status: "approved" | "rejected"): Promise<Owner> {
    const [owner] = await db
      .update(owners)
      .set({ 
        status, 
        approvedAt: status === "approved" ? new Date() : null 
      })
      .where(eq(owners.id, id))
      .returning();
    return owner;
  }

  async getPendingOwners(): Promise<Owner[]> {
    return await db.select().from(owners).where(eq(owners.status, "pending"));
  }

  async getParkingSlot(id: string): Promise<ParkingSlot | undefined> {
    const [slot] = await db.select().from(parkingSlots).where(eq(parkingSlots.id, id));
    return slot || undefined;
  }

  async getAvailableSlots(city?: string, vehicleType?: string): Promise<ParkingSlot[]> {
    const conditions = [eq(parkingSlots.isAvailable, true)];
    
    if (city) {
      conditions.push(eq(parkingSlots.city, city));
    }
    
    if (vehicleType) {
      conditions.push(eq(parkingSlots.vehicleType, vehicleType as any));
    }
    
    return await db.select().from(parkingSlots).where(and(...conditions));
  }

  async getSlotsByOwner(ownerId: string): Promise<ParkingSlot[]> {
    return await db.select().from(parkingSlots).where(eq(parkingSlots.ownerId, ownerId));
  }

  async createParkingSlot(insertSlot: InsertParkingSlot): Promise<ParkingSlot> {
    const [slot] = await db.insert(parkingSlots).values(insertSlot).returning();
    return slot;
  }

  async updateSlotAvailability(id: string, isAvailable: boolean): Promise<ParkingSlot> {
    const [slot] = await db
      .update(parkingSlots)
      .set({ isAvailable })
      .where(eq(parkingSlots.id, id))
      .returning();
    return slot;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByOwner(ownerId: string): Promise<Booking[]> {
    return await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        slotId: bookings.slotId,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        duration: bookings.duration,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        paymentIntentId: bookings.paymentIntentId,
        createdAt: bookings.createdAt,
        approvedAt: bookings.approvedAt,
        paidAt: bookings.paidAt,
      })
      .from(bookings)
      .innerJoin(parkingSlots, eq(bookings.slotId, parkingSlots.id))
      .where(eq(parkingSlots.ownerId, ownerId))
      .orderBy(desc(bookings.createdAt));
  }

  async getPendingBookingsForOwner(ownerId: string): Promise<Booking[]> {
    return await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        slotId: bookings.slotId,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        duration: bookings.duration,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        paymentIntentId: bookings.paymentIntentId,
        createdAt: bookings.createdAt,
        approvedAt: bookings.approvedAt,
        paidAt: bookings.paidAt,
      })
      .from(bookings)
      .innerJoin(parkingSlots, eq(bookings.slotId, parkingSlots.id))
      .where(
        and(
          eq(parkingSlots.ownerId, ownerId),
          eq(bookings.status, "pending")
        )
      )
      .orderBy(desc(bookings.createdAt));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBookingStatus(id: string, status: string, paymentIntentId?: string): Promise<Booking> {
    const updateData: any = { status };
    
    if (status === "approved") {
      updateData.approvedAt = new Date();
    } else if (status === "paid") {
      updateData.paidAt = new Date();
    }
    
    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }

    const [booking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async getOwnerStats(ownerId: string): Promise<{
    totalSlots: number;
    occupiedSlots: number;
    monthlyRevenue: number;
    pendingRequests: number;
  }> {
    const [totalSlotsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(parkingSlots)
      .where(eq(parkingSlots.ownerId, ownerId));

    const [occupiedSlotsResult] = await db
      .select({ count: sql<number>`count(DISTINCT slot_id)` })
      .from(bookings)
      .innerJoin(parkingSlots, eq(bookings.slotId, parkingSlots.id))
      .where(
        and(
          eq(parkingSlots.ownerId, ownerId),
          eq(bookings.status, "paid")
        )
      );

    const [pendingRequestsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .innerJoin(parkingSlots, eq(bookings.slotId, parkingSlots.id))
      .where(
        and(
          eq(parkingSlots.ownerId, ownerId),
          eq(bookings.status, "pending")
        )
      );

    const [revenueResult] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0)` 
      })
      .from(bookings)
      .innerJoin(parkingSlots, eq(bookings.slotId, parkingSlots.id))
      .where(
        and(
          eq(parkingSlots.ownerId, ownerId),
          eq(bookings.status, "paid"),
          sql`bookings.created_at >= date_trunc('month', current_date)`
        )
      );

    return {
      totalSlots: totalSlotsResult.count,
      occupiedSlots: occupiedSlotsResult.count,
      monthlyRevenue: Number(revenueResult.total) || 0,
      pendingRequests: pendingRequestsResult.count,
    };
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    totalOwners: number;
    activeBookings: number;
    monthlyRevenue: number;
  }> {
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [ownerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(owners)
      .where(eq(owners.status, "approved"));

    const [activeBookingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(eq(bookings.status, "paid"));

    const [revenueResult] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0)` 
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.status, "paid"),
          sql`created_at >= date_trunc('month', current_date)`
        )
      );

    return {
      totalUsers: userCount.count,
      totalOwners: ownerCount.count,
      activeBookings: activeBookingCount.count,
      monthlyRevenue: Number(revenueResult.total) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
