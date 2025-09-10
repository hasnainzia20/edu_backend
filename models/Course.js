import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  lesson_id: Number,
  lesson_title: String,
  duration: String,
});

const moduleSchema = new mongoose.Schema({
  module_id: Number,
  module_title: String,
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: String,
    image: String,
    type: { type: String, enum: ["FREE", "PAID"], default: "FREE" },
    rating: Number,
    learners: Number,
    level: String,
    duration: String,
    price: {
      type: Number,
      required: function () {
        return this.type === "PAID";
      },
      default: 0,
    },
    course_description: String,
    about_the_course: String,

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    instructor_name: String,
    instructor_image: String,
    skills_gained: [String],
    lectures: Number,
    students_enrolled: Number,
    language: String,
    certificate_provided: Boolean,
    course_content: [moduleSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
