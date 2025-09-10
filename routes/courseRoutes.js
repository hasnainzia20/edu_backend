import express from "express";
import Course from "../models/Course.js";
import { User } from "../models/User.js";
import { auth, requireRole } from "../middelware/auth.js";
import { upload } from "../middelware/upload.js";

const router = express.Router();

// GET all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name email");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single course by slug
router.get("/:slug", async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).populate(
      "instructor",
      "name email"
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// NEW ROUTE TO HANDLE ENROLLMENT
router.post("/:id/enroll", auth, requireRole("student"), async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const studentId = req.user._id;

    // Find the course to enroll in
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the student's document by their ID
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the student is already enrolled
    if (student.enrolledCourses.some((c) => c.toString() === courseId)) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // Add the course to the student's enrolledCourses array
    student.enrolledCourses.push(courseId);
    await student.save();

    res.status(200).json({ message: "Successfully enrolled in the course" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// // CREATE course (only instructor/admin)
// router.post("/", auth, requireRole("instructor"), async (req, res) => {
//   try {
//     // Never trust client-sent instructor
//     const courseData = {
//       ...req.body,
//       instructor: req.user._id,
//     };

//     const newCourse = new Course(courseData);
//     const savedCourse = await newCourse.save();
//     res.status(201).json(savedCourse);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// CREATE course (with image upload)
router.post(
  "/",
  auth,
  requireRole("instructor"),
  upload.fields([{ name: "image" }, { name: "instructor_image" }]),
  async (req, res) => {
    try {
      const courseData = {
        ...req.body,
        instructor: req.user._id,
      };

      // Save image paths if files exist
      if (req.files?.image) {
        courseData.image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files?.instructor_image) {
        courseData.instructor_image = `/uploads/${req.files.instructor_image[0].filename}`;
      }

      // Parse JSON fields from frontend
      if (courseData.skills_gained) {
        courseData.skills_gained = JSON.parse(courseData.skills_gained);
      }
      if (courseData.course_content) {
        courseData.course_content = JSON.parse(courseData.course_content);
      }

      const newCourse = new Course(courseData);
      const savedCourse = await newCourse.save();

      res.status(201).json(savedCourse);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  }
);

// // UPDATE course (only creator or admin)
// router.put("/:id", auth, requireRole("instructor"), async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id);
//     if (!course) return res.status(404).json({ message: "Course not found" });

//     // Only course creator or admin
//     if (
//       course.instructor.toString() !== req.user._id.toString() &&
//       req.user.role !== "admin"
//     ) {
//       return res.status(403).json({ message: "Not allowed" });
//     }

//     // Prevent changing instructor from body
//     delete req.body.instructor;

//     Object.assign(course, req.body);
//     const updatedCourse = await course.save();
//     res.json(updatedCourse);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

router.put(
  "/:id",
  auth,
  requireRole("instructor"),
  upload.fields([{ name: "image" }, { name: "instructor_image" }]),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: "Course not found" });

      if (
        course.instructor.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ message: "Not allowed" });
      }

      delete req.body.instructor;

      // Save image paths if files exist
      if (req.files?.image) {
        req.body.image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files?.instructor_image) {
        req.body.instructor_image = `/uploads/${req.files.instructor_image[0].filename}`;
      }

      // Parse JSON fields
      if (req.body.skills_gained) {
        req.body.skills_gained = JSON.parse(req.body.skills_gained);
      }
      if (req.body.course_content) {
        req.body.course_content = JSON.parse(req.body.course_content);
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      res.json(updatedCourse);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// DELETE course
router.delete("/:id", auth, requireRole("instructor"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await course.deleteOne();
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
