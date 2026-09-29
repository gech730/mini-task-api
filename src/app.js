import express from "express";

import dotenv from "dotenv";
dotenv.config();
import prisma from "./db.js"
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Mini Task API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", async (req, res) => {
    try{
        await prisma.$queryRaw`SELECT 1`;
         res.json({
           status: "ok",
           database:"connected"
       });
    }
    catch(error){
        res.status(500).json({
            status: "error",
            database:"not connected",
            error: error.message
        });
    }
});

app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create task",
    });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch tasks",
    });
  }
});

app.get("/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const task = await prisma.task.findUnique({
      where: {
        id,
      },
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch task",
    });
  }
});

app.patch("/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, completed } = req.body;

    const task = await prisma.task.update({
      where: {
        id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed }),
      },
    });

    res.json(task);
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.status(500).json({
      error: "Failed to update task",
    });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.task.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.status(500).json({
      error: "Failed to delete task",
    });
  }
});


export default app;