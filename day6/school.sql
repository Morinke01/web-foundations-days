-- Enable foreign key checks in SQLite for this connection.
PRAGMA foreign_keys = ON;

CREATE TABLE students (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE
);

CREATE TABLE enrolments (
  student_id INTEGER NOT NULL,
  course_id  INTEGER NOT NULL,
  grade      TEXT,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);

INSERT INTO students (id, name, email) VALUES
  (1, 'Amina Otieno', 'amina@example.com'),
  (2, 'Brian Kamau', 'brian@example.com'),
  (3, 'Wanjiku Njeri', 'wanjiku@example.com'),
  (4, 'Kevin Mwangi', 'kevin@example.com');

INSERT INTO courses (id, name) VALUES
  (1, 'Mathematics'),
  (2, 'Science'),
  (3, 'English');

INSERT INTO enrolments (student_id, course_id, grade) VALUES
  (1, 1, 'A'),
  (1, 2, 'B'),
  (2, 1, 'B'),
  (2, 3, 'A'),
  (3, 2, 'A');

-- All courses for one student, matched by name.
SELECT courses.name AS course_name
FROM students
JOIN enrolments ON enrolments.student_id = students.id
JOIN courses ON courses.id = enrolments.course_id
WHERE students.name = 'Amina Otieno'
ORDER BY courses.name;

-- All students enrolled on one course.
SELECT students.name AS student_name
FROM courses
JOIN enrolments ON enrolments.course_id = courses.id
JOIN students ON students.id = enrolments.student_id
WHERE courses.name = 'Mathematics'
ORDER BY students.name;

-- Number of students per course, including courses with no enrolments.
SELECT courses.name AS course_name, COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments ON enrolments.course_id = courses.id
GROUP BY courses.id, courses.name
ORDER BY courses.name;

-- Students who have no enrolments.
SELECT students.name AS student_name
FROM students
LEFT JOIN enrolments ON enrolments.student_id = students.id
WHERE enrolments.student_id IS NULL
ORDER BY students.name;

-- Update one enrolment's grade.
UPDATE enrolments
SET grade = 'A-'
WHERE student_id = 1 AND course_id = 2;
