import Parser from './parser'
import Solver from './solver'

const blueprintInputs = Parser.parse_input_file('demo.txt')
const solver = new Solver(blueprintInputs)
console.log(solver.solve())