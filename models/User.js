import mongoose from "mongoose";

// 1. Define the base schema for all users.
// This includes all fields common to both students and instructors.
const baseOptions = {
  discriminatorKey: "role", // The field that will determine the document type
  timestamps: true,
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  baseOptions
);

// 2. Create the base User model from the schema.
const User = mongoose.model("User", userSchema);

// 3. Create the 'Student' discriminator.
// This inherits all fields from the base user schema and adds 'enrolledCourses'.
const Student = User.discriminator(
  "student",
  new mongoose.Schema({
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  })
);

// 4. Create the 'Instructor' discriminator.
// This inherits from the base user schema but adds no new fields.
// It exists to create a distinct document type.
const Instructor = User.discriminator("instructor", new mongoose.Schema({}));

export { User, Student, Instructor };
