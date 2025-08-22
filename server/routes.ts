import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import Stripe from "stripe";
import { storage } from "./storage";
import { 
  authenticateToken, 
  requireRole, 
  hashPassword, 
  comparePassword, 
  generateToken,
  type AuthenticatedRequest 
} from "./middleware/auth";
import { insertUserSchema, insertOwnerSchema, insertParkingSlotSchema, insertBookingSchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "development" ? "*" : false,
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_user_room", (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Helper function to emit real-time notifications
  const emitNotification = (userId: string, notification: any) => {
    io.to(`user_${userId}`).emit("new_notification", notification);
  };
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      
      // Validate input
      const userData = insertUserSchema.parse({ username, email, password, role });
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // If user is registering as owner, create owner profile
      if (role === "owner") {
        await storage.createOwner({
          userId: user.id,
          businessName: `${username}'s Parking Business`,
          address: "",
          city: "",
          phone: "",
          status: "pending"
        });
      }

      // Generate token
      const token = generateToken(user.id, user.role);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.role);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Owner application routes
  app.post("/api/owners/apply", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const ownerData = insertOwnerSchema.parse(req.body);
      const owner = await storage.createOwner({
        ...ownerData,
        userId: req.user!.id,
      });

      // Create notification for user and emit real-time update
      const notification = await storage.createNotification({
        userId: req.user!.id,
        title: "Owner Application Submitted",
        message: "Your application to become a parking owner has been submitted for review.",
        type: "info",
      });
      emitNotification(req.user!.id, notification);

      res.json(owner);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/owners/pending", authenticateToken, requireRole(["admin"]), async (req, res) => {
    try {
      const pendingOwners = await storage.getPendingOwners();
      res.json(pendingOwners);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/owners/:id/status", authenticateToken, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const owner = await storage.updateOwnerStatus(id, status);
      
      // Create notification for owner and emit real-time update
      const notification = await storage.createNotification({
        userId: owner.userId,
        title: `Owner Application ${status}`,
        message: `Your application to become a parking owner has been ${status}.`,
        type: status === "approved" ? "success" : "error",
      });
      emitNotification(owner.userId, notification);

      res.json(owner);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Parking slot routes
  app.get("/api/slots", async (req, res) => {
    try {
      const { city, vehicleType } = req.query;
      const slots = await storage.getAvailableSlots(
        city as string,
        vehicleType as string
      );
      res.json(slots);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/slots/owner", authenticateToken, requireRole(["owner"]), async (req: AuthenticatedRequest, res) => {
    try {
      const owner = await storage.getOwnerByUserId(req.user!.id);
      if (!owner) {
        return res.status(404).json({ message: "Owner profile not found" });
      }

      const slots = await storage.getSlotsByOwner(owner.id);
      res.json(slots);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/slots", authenticateToken, requireRole(["owner"]), async (req: AuthenticatedRequest, res) => {
    try {
      const owner = await storage.getOwnerByUserId(req.user!.id);
      if (!owner || owner.status !== "approved") {
        return res.status(403).json({ message: "Owner not approved" });
      }

      const slotData = insertParkingSlotSchema.parse(req.body);
      const slot = await storage.createParkingSlot({
        ...slotData,
        ownerId: owner.id,
      });

      res.json(slot);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Booking routes
  app.get("/api/bookings/user", authenticateToken, requireRole(["user"]), async (req: AuthenticatedRequest, res) => {
    try {
      const bookings = await storage.getBookingsByUser(req.user!.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bookings/owner", authenticateToken, requireRole(["owner"]), async (req: AuthenticatedRequest, res) => {
    try {
      const owner = await storage.getOwnerByUserId(req.user!.id);
      if (!owner) {
        return res.status(404).json({ message: "Owner profile not found" });
      }

      const bookings = await storage.getBookingsByOwner(owner.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bookings/pending", authenticateToken, requireRole(["owner"]), async (req: AuthenticatedRequest, res) => {
    try {
      const owner = await storage.getOwnerByUserId(req.user!.id);
      if (!owner) {
        return res.status(404).json({ message: "Owner profile not found" });
      }

      const bookings = await storage.getPendingBookingsForOwner(owner.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bookings", authenticateToken, requireRole(["user"]), async (req: AuthenticatedRequest, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Check if slot is available
      const slot = await storage.getParkingSlot(bookingData.slotId);
      if (!slot || !slot.isAvailable) {
        return res.status(400).json({ message: "Parking slot not available" });
      }

      const booking = await storage.createBooking({
        ...bookingData,
        userId: req.user!.id,
      });

      // Create notification for user and emit real-time update
      const notification = await storage.createNotification({
        userId: req.user!.id,
        title: "Booking Created",
        message: "Your parking booking has been submitted for approval.",
        type: "info",
      });
      emitNotification(req.user!.id, notification);

      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/bookings/:id/status", authenticateToken, requireRole(["owner"]), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const booking = await storage.updateBookingStatus(id, status);

      // Create notification for user and emit real-time update
      const userNotification = await storage.createNotification({
        userId: booking.userId,
        title: `Booking ${status}`,
        message: `Your parking booking has been ${status}.`,
        type: status === "approved" ? "success" : "warning",
      });
      emitNotification(booking.userId, userNotification);

      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { bookingId } = req.body;
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const amount = Math.round(parseFloat(booking.totalAmount) * 100); // Convert to paise

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "inr",
        metadata: {
          bookingId: booking.id,
          userId: req.user!.id,
        },
      });

      await storage.updateBookingStatus(booking.id, "paid", paymentIntent.id);

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Notification routes
  app.get("/api/notifications", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user!.id);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", authenticateToken, requireRole(["admin"]), async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create new admin user (admin only)
  app.post("/api/admin/create-admin", authenticateToken, requireRole(["admin"]), async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const admin = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role: "admin"
      });

      res.json({ message: "Admin user created successfully", adminId: admin.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
