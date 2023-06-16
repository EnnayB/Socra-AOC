import { readFileSync } from 'fs'

import { Blueprint, Material, MaterialList, RobotCost } from './models'

const ROBOT_COST_REGEX = /Each (?<RobotMaterial>\w+) robot costs (?<FirstQuantity>\d+) (?<FirstMaterial>\w+)(?:(?:, (?<ExtraQuantity>\d+) (?<ExtraMaterial>\w+))? and (?<SecondQuantity>\d+) (?<SecondMaterial>\w+))?/

export default class Parser {
  private content: string

  constructor(content: string) {
    this.content = content
  }

  private parseRobotCost(content: string): RobotCost {
    const match = content.match(ROBOT_COST_REGEX)
    if (match === null || match.groups === undefined) {
      throw Error('Could not parse Robot Cost')
    }

    const robotMaterial = match.groups['RobotMaterial']?.toUpperCase() as Material
    const firstQuantity = Number(match.groups['FirstQuantity'])
    const secondQuantity = Number(match.groups['SecondQuantity'])
    const thirdQuantity = Number(match.groups['ThirdQuantity'])
    const firstMaterial = match.groups['FirstMaterial']?.toUpperCase() as Material
    const secondMaterial = match.groups['SecondMaterial']?.toUpperCase() as Material
    const thirdMaterial = match.groups['ThirdMaterial']?.toUpperCase() as Material

    const robotCostMaterials: MaterialList = new MaterialList()

    robotCostMaterials.setMaterialQuantity(firstMaterial, firstQuantity)
    if (secondMaterial !== undefined) {
      robotCostMaterials.setMaterialQuantity(secondMaterial, secondQuantity)
    }

    if (thirdMaterial !== undefined) {
      robotCostMaterials.setMaterialQuantity(thirdMaterial, thirdQuantity)
    }

    return new RobotCost(robotMaterial, robotCostMaterials)
  }

  private parseBlueprint(line: string): Blueprint {
    const [name, costs] = line.split(': ')
    const robotCosts = costs.split('. ')

    const parsedBlueprint = new Blueprint(name)
    for (const robotCost of robotCosts) {
      parsedBlueprint.addRobotCost(this.parseRobotCost(robotCost))
    }

    return parsedBlueprint
  }

  public parse(): Blueprint[] {
    const parsedBlueprints: Blueprint[] = []

    for (const line of this.content.split(/\r?\n/)) {
      parsedBlueprints.push(this.parseBlueprint(line))
    }

    return parsedBlueprints
  }

  static parse_input_file(filePath: string): Blueprint[] {
    const content = readFileSync(filePath, 'utf-8')

    const parser = new Parser(content)

    return parser.parse()
  }
}
