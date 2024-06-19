#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table';
// Define classes: Person, Student, Instructor, Course, Department
class Person {
    name;
    age;
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
}
class Student extends Person {
    rollnumber;
    courses = [];
    constructor(name, age, rollnumber) {
        super(name, age);
        this.rollnumber = rollnumber;
    }
    registerForCourse(course) {
        this.courses.push(course);
        course.addStudent(this); // Add student to the course
    }
    static listStudents(students) {
        if (students.length === 0) {
            console.log(chalk.yellow('No students registered yet.'));
            return;
        }
        const table = new Table({
            head: ['Roll Number', 'Name', 'Age', 'Courses Enrolled'],
            colWidths: [15, 25, 10, 30]
        });
        students.forEach(student => {
            const coursesEnrolled = student.courses.map(course => course.name).join(', ');
            table.push([student.rollnumber.toString(), student.name, student.age.toString(), coursesEnrolled]);
        });
        console.log(chalk.cyan('List of Students:'));
        console.log(table.toString());
    }
}
class Instructor extends Person {
    salary;
    courses = [];
    constructor(name, age, salary) {
        super(name, age);
        this.salary = salary;
    }
    assignCourse(course) {
        this.courses.push(course);
        course.setInstructor(this); // Set instructor for the course
    }
}
class Course {
    id;
    name;
    instructors = [];
    students = [];
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    setInstructor(instructor) {
        this.instructors.push(instructor);
    }
    addStudent(student) {
        this.students.push(student);
    }
    listStudents() {
        return this.students.map(student => ({
            rollnumber: student.rollnumber.toString(),
            name: student.name,
            age: student.age.toString()
        }));
    }
}
class Department {
    name;
    courses = [];
    instructors = [];
    constructor(name) {
        this.name = name;
    }
    addCourse(course) {
        this.courses.push(course);
    }
    addInstructor(instructor) {
        this.instructors.push(instructor); // Push single instructor object
    }
    listCourses() {
        return this.courses.map(course => ({
            id: course.id,
            name: course.name,
            numStudents: course.students.length,
            numInstructors: course.instructors.length
        }));
    }
    getCourses() {
        return this.courses.map(course => ({
            name: course.name,
            value: course // Store the course object as the value
        }));
    }
    getInstructors() {
        return this.instructors.map(instructor => ({
            name: instructor.name,
            value: instructor // Store the instructor object as the value
        }));
    }
}
// Initialize departments
const computerScience = new Department('Computer Science');
const mathematics = new Department('Mathematics');
const physics = new Department('Physics');
// Add courses to departments
computerScience.addCourse(new Course(1, 'Introduction to Programming'));
computerScience.addCourse(new Course(2, 'Database Systems'));
mathematics.addCourse(new Course(3, 'Calculus'));
mathematics.addCourse(new Course(4, 'Linear Algebra'));
physics.addCourse(new Course(5, 'Classical Mechanics'));
physics.addCourse(new Course(6, 'Quantum Physics'));
// Global student list
const students = [];
// Global instructor list
const instructors = [];
// Student roll number counter
let studentRollNumberCounter = 1;
// Function to select a department
async function selectDepartment() {
    const departmentChoices = [
        { name: 'Computer Science', value: computerScience },
        { name: 'Mathematics', value: mathematics },
        { name: 'Physics', value: physics }
    ];
    const { department } = await inquirer.prompt({
        name: 'department',
        type: 'list',
        message: 'Choose a department:',
        choices: departmentChoices
    });
    return department;
}
// Function to select a course within a department
async function selectCourse(department) {
    const courseChoices = department.getCourses();
    const { course } = await inquirer.prompt({
        name: 'course',
        type: 'list',
        message: `Choose a course in ${department.name}:`,
        choices: courseChoices
    });
    return course;
}
// Function to select an instructor
async function selectInstructor() {
    const instructorChoices = instructors.map(instructor => ({
        name: instructor.name,
        value: instructor
    }));
    const { instructor } = await inquirer.prompt({
        name: 'instructor',
        type: 'list',
        message: 'Choose an instructor:',
        choices: instructorChoices
    });
    return instructor;
}
const handlers = {
    'Add Student': async () => {
        const studentAnswers = await inquirer.prompt([
            {
                name: 'name',
                message: 'Enter student name:',
                type: 'input'
            },
            {
                name: 'age',
                message: 'Enter student age:',
                type: 'number'
            }
        ]);
        const newStudent = new Student(studentAnswers.name, studentAnswers.age, studentRollNumberCounter++);
        students.push(newStudent); // Add to the global student list
        const department = await selectDepartment();
        const course = await selectCourse(department);
        newStudent.registerForCourse(course);
        console.log(chalk.green(`Student added: ${newStudent.name} with Roll Number: ${newStudent.rollnumber}`));
        console.log(chalk.green(`Student ${newStudent.name} added to course ${course.name}`));
    },
    'Add Instructor to Department': async () => {
        const instructorAnswers = await inquirer.prompt([
            {
                name: 'name',
                message: 'Enter instructor name:',
                type: 'input'
            },
            {
                name: 'age',
                message: 'Enter instructor age:',
                type: 'number'
            },
            {
                name: 'salary',
                message: 'Enter instructor salary:',
                type: 'number'
            }
        ]);
        const newInstructor = new Instructor(instructorAnswers.name, instructorAnswers.age, instructorAnswers.salary);
        instructors.push(newInstructor); // Add to the global instructor list
        const department = await selectDepartment();
        department.addInstructor(newInstructor);
        console.log(`Instructor ${newInstructor.name} added to ${department.name}`);
    },
    'Assign Instructor to Course': async () => {
        const department = await selectDepartment();
        const instructor = await selectInstructor();
        const courseChoices = department.getCourses();
        const { course } = await inquirer.prompt({
            name: 'course',
            type: 'list',
            message: `Choose a course in ${department.name} to assign ${instructor.name}:`,
            choices: courseChoices
        });
        instructor.assignCourse(course);
        console.log(`Instructor ${instructor.name} assigned to course ${course.name}`);
    },
    'List Courses in Department': async () => {
        const department = await selectDepartment();
        const courseList = department.listCourses();
        if (courseList.length === 0) {
            console.log(`No courses found in ${department.name} department.`);
        }
        else {
            console.log(`Courses in ${department.name} department:`);
            const table = new Table({
                head: ['ID', 'Name', 'Students Enrolled', 'Instructors Assigned'],
                colWidths: [5, 25, 20, 25]
            });
            courseList.forEach(course => {
                table.push([
                    course.id.toString(),
                    course.name,
                    course.numStudents.toString(),
                    course.numInstructors.toString()
                ]);
            });
            console.log(table.toString());
        }
    },
    'List Students': async () => {
        if (students.length === 0) {
            console.log(chalk.yellow('No students registered yet.'));
        }
        else {
            Student.listStudents(students);
        }
    },
    'Exit': () => {
        console.log(chalk.magenta('Goodbye!'));
        process.exit();
    }
};
async function main() {
    while (true) {
        const { action } = await inquirer.prompt({
            name: 'action',
            type: 'list',
            message: 'What do you want to do?',
            choices: Object.keys(handlers)
        });
        if (handlers[action]) {
            await handlers[action]();
        }
        else {
            console.log(chalk.red('Invalid option'));
        }
    }
}
main();
