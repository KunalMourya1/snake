/**
 * Math Problems Generator for Class 1-5 Students
 * Generates age-appropriate mathematical problems based on difficulty level
 */

class MathProblemGenerator {
    constructor() {
        this.currentLevel = 1;
        this.problemTypes = {
            1: ['addition_simple', 'subtraction_simple'],
            2: ['addition_medium', 'subtraction_medium', 'counting'],
            3: ['addition_hard', 'subtraction_hard', 'multiplication_simple'],
            4: ['multiplication_medium', 'division_simple', 'mixed_operations'],
            5: ['multiplication_hard', 'division_medium', 'word_problems']
        };
    }

    setLevel(level) {
        this.currentLevel = Math.max(1, Math.min(5, level));
    }

    generateProblem() {
        const availableTypes = this.problemTypes[this.currentLevel];
        const problemType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        
        return this.createProblem(problemType);
    }

    createProblem(type) {
        switch(type) {
            case 'addition_simple':
                return this.createAddition(1, 10);
            
            case 'addition_medium':
                return this.createAddition(10, 50);
            
            case 'addition_hard':
                return this.createAddition(20, 100);
            
            case 'subtraction_simple':
                return this.createSubtraction(1, 10);
            
            case 'subtraction_medium':
                return this.createSubtraction(10, 50);
            
            case 'subtraction_hard':
                return this.createSubtraction(20, 100);
            
            case 'multiplication_simple':
                return this.createMultiplication(1, 5);
            
            case 'multiplication_medium':
                return this.createMultiplication(2, 10);
            
            case 'multiplication_hard':
                return this.createMultiplication(5, 15);
            
            case 'division_simple':
                return this.createDivision(2, 20, 2, 5);
            
            case 'division_medium':
                return this.createDivision(10, 50, 2, 10);
            
            case 'counting':
                return this.createCounting();
            
            case 'mixed_operations':
                return this.createMixedOperation();
            
            case 'word_problems':
                return this.createWordProblem();
            
            default:
                return this.createAddition(1, 10);
        }
    }

    createAddition(min, max) {
        const num1 = this.randomInt(min, max);
        const num2 = this.randomInt(min, max);
        return {
            question: `${num1} + ${num2}`,
            answer: num1 + num2,
            type: 'addition'
        };
    }

    createSubtraction(min, max) {
        const num1 = this.randomInt(min, max);
        const num2 = this.randomInt(min, num1); // Ensure positive result
        return {
            question: `${num1} - ${num2}`,
            answer: num1 - num2,
            type: 'subtraction'
        };
    }

    createMultiplication(min, max) {
        const num1 = this.randomInt(min, max);
        const num2 = this.randomInt(min, max);
        return {
            question: `${num1} × ${num2}`,
            answer: num1 * num2,
            type: 'multiplication'
        };
    }

    createDivision(minResult, maxResult, minDivisor, maxDivisor) {
        const divisor = this.randomInt(minDivisor, maxDivisor);
        const quotient = this.randomInt(minResult / divisor, maxResult / divisor);
        const dividend = divisor * quotient;
        
        return {
            question: `${dividend} ÷ ${divisor}`,
            answer: quotient,
            type: 'division'
        };
    }

    createCounting() {
        const start = this.randomInt(1, 20);
        const increment = this.randomInt(2, 5);
        const sequence = [start, start + increment, start + (increment * 2)];
        
        return {
            question: `${sequence.join(', ')}, ?`,
            answer: start + (increment * 3),
            type: 'counting'
        };
    }

    createMixedOperation() {
        const operations = ['+', '-', '×'];
        const op = operations[Math.floor(Math.random() * operations.length)];
        
        if (op === '+') {
            return this.createAddition(5, 25);
        } else if (op === '-') {
            return this.createSubtraction(10, 30);
        } else {
            return this.createMultiplication(2, 8);
        }
    }

    createWordProblem() {
        const problems = [
            {
                question: "Sarah has 8 apples. She gives 3 to her friend. How many does she have left?",
                answer: 5,
                calculation: "8 - 3"
            },
            {
                question: "There are 4 boxes with 6 toys each. How many toys in total?",
                answer: 24,
                calculation: "4 × 6"
            },
            {
                question: "Tom collected 15 stickers. He gave away 7. How many does he have now?",
                answer: 8,
                calculation: "15 - 7"
            },
            {
                question: "A pack has 12 cookies. If 3 children share equally, how many cookies each?",
                answer: 4,
                calculation: "12 ÷ 3"
            }
        ];

        const problem = problems[Math.floor(Math.random() * problems.length)];
        return {
            question: problem.question,
            answer: problem.answer,
            type: 'word_problem',
            calculation: problem.calculation
        };
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getDifficultyInfo() {
        const info = {
            1: { name: "Beginner", description: "Simple addition and subtraction (1-10)" },
            2: { name: "Elementary", description: "Medium addition, subtraction, and counting (1-50)" },
            3: { name: "Intermediate", description: "Harder operations and simple multiplication" },
            4: { name: "Advanced", description: "Multiplication, division, and mixed operations" },
            5: { name: "Expert", description: "Complex problems and word problems" }
        };
        
        return info[this.currentLevel];
    }

    getHint(problem) {
        const hints = {
            'addition': "Try counting forward from the first number!",
            'subtraction': "Try counting backward from the first number!",
            'multiplication': "Think of it as repeated addition!",
            'division': "How many times does the second number fit into the first?",
            'counting': "Look for the pattern in the sequence!",
            'word_problem': "Read carefully and find the numbers to work with!"
        };
        
        return hints[problem.type] || "Take your time and think step by step!";
    }
}

// Export for use in other files
window.MathProblemGenerator = MathProblemGenerator;
