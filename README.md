## validate-declarative
A utility for validating the structure of any JS object in a simple, declarative manner.
Fast, lightweight, and highly extensible.


**See it in action:**
```javascript
import {verify, string, boolean, int, nonNegativeInt} from 'validate-declarative';

// Define the schema for your objects
const courseSchema = {
    courseName: {
        $test: /[A-Za-z0-9 ]+/
    },
    capacity: nonNegativeInt,
    professor: {
        name: string,
        tenured: boolean,
        salary: {
            $type: int,
            $test: (object) => {return 50000 <= object && object <= 150000;}
        }
    },
    teacherAssistants: {
        $optional: true,
        $element: string
    }
};

// Create some objects
let objectOrientedCourse = {
    courseName: "Object Oriented Programming",
    capacity: 30,
    professor: {
        name: "Dr. Placeholder",
        tenured: true,
        salary: 124000
    },
    teacherAssistants: ["Matthew R.", "Jennifer Q."]
};

let microprocessorsCourse = {
    courseName: "Microprocessors",
    capacity: 25,
    professor: {
        name: "Mr. Baz",
        tenured: false,
        salary: 45000
    }
};

// true - the object matches the schema!
let result1 = verify(courseSchema, objectOrientedCourse);

// false - professor.salary fails the $test constraint!
let result2 = verify(courseSchema, microprocessorsCourse);
```