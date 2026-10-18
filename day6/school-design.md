# School Database Design

## Tables

- **students** stores each student once. Its `id` is the primary key, `name` is required, and `email` is required and unique so the same email cannot be assigned to multiple students.
- **courses** stores each course once. Its `id` is the primary key, and `name` is required and unique.
- **enrolments** records a student's registration in a course, including the student's `grade`. The pair (`student_id`, `course_id`) is the composite primary key, which prevents the same student from enrolling in the same course twice. Both columns are foreign keys to their parent tables.

## Relationships

Students and enrolments have a one-to-many relationship: one student can have many enrolments, while each enrolment refers to one student. Courses and enrolments also have a one-to-many relationship: one course can have many enrolments, while each enrolment refers to one course. Together these represent a many-to-many relationship between students and courses, because each student can take several courses and each course can have several students. The `enrolments` join table is needed to connect the two sides and to store relationship-specific information, the grade.

## Index

I would add an index on `enrolments(course_id)`. It speeds up finding all students enrolled in a course and counting enrolments per course. The composite primary key starts with `student_id`, so it is useful for student lookups, but it does not provide the same direct lookup by `course_id`.

## SQL or NoSQL?

I would choose a relational SQL database for this system. Students, courses, and enrolments have clear fields and relationships, and the database can enforce unique emails, valid foreign keys, and the rule against duplicate enrolments. SQL joins make it straightforward to list courses for a student, students in a course, and enrolment counts. A document database could work, but it would require more application-side effort to keep these relationships and constraints consistent.
