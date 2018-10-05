## validate-declarative
A simple, highly-extensible utility for validating the structure of any JS object.

```javascript
import {verify, string, boolean, int, nonNegativeInt} from 'validate-declarative';

const schema = {
    courseName: {
        $test: /[A-Za-z0-9 ]/
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
        $element: string
    }
};

let course1 = {
    courseName: "Object Oriented Programming",
    capacity: 30,
    professor: {
        name: "Dr. Placeholder",
        tenured: true,
        salary: 124000
    },
    teacherAssistants: ["Matthew R.", "Jennifer Q."]
};

let course2 = {
    courseName: "Microprocessors",
    capacity: 25,
    professor: {
        name: "Mr. Baz",
        tenured: false,
        salary: 45000
    },
    teacherAssistants: []
};

console.log(verify(schema, course1)); // prints true
console.log(verify(schema, course2)); // prints false (professor.salary fails $test)
```