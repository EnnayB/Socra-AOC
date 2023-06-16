import { Inventory, Material, MaterialCount, Robot, RobotCost } from './models'

const MAX_TURN = 24
const ROBOT_MINING_CAPACITY = 1

export default class Game {
  public turn: number
  private materialCap: MaterialCount
  private robotsCount: MaterialCount
  public inventory: Inventory

  constructor(materialCap: MaterialCount) {
    this.turn = 1
    this.materialCap = materialCap
    this.robotsCount = {
      ORE: 1,
      CLAY: 0,
      OBSIDIAN: 0,
      GEODE: 0,
      DIAMOND: 0,
    }
    this.inventory = new Inventory()
  }

  public isOver(): boolean {
    return this.turn == MAX_TURN
  }

  public remainingTurns(): number {
    return MAX_TURN - this.turn
  }

  public nextTurn(): boolean {
    if (this.isOver()) {
      return true
    }

    this.turn += 1
    this.getMaterialsOnTurn()
    return this.isOver()
  }

  private getMaterialsOnTurn() {
    for (const material in Material) {
      this.inventory.addMaterial(material as Material, this.robotsCount[material as Material] * ROBOT_MINING_CAPACITY)
    }
  }

  public buyRobot(robot: RobotCost): boolean {
    const isOver = this.nextTurn()
    this.inventory.buyRobot(robot)
    this.robotsCount[robot.miningMaterial] += 1
    return isOver
  }

  public isRobotValuable(robot: Robot): boolean {
    if (robot.miningMaterial == Material.DIAMOND) {
      return true
    }

    return this.materialCap[robot.miningMaterial] > this.robotsCount[robot.miningMaterial]
  }

  public getDiamondNumber(): number {
    return this.inventory.getMaterialQuantity(Material.DIAMOND)
  }

  public copy(): Game {
    const copyGame = new Game(this.materialCap)
    copyGame.turn = this.turn
    copyGame.robotsCount = {...this.robotsCount}
    copyGame.inventory = this.inventory.copy()

    return copyGame
  }

  public getRobotQuantity(material: Material): number {
    return this.robotsCount[material]
  }

  public toString(): string {
    const gameInfo = {
      turn: this.turn,
      robotsCount: this.robotsCount
    }
    return JSON.stringify(gameInfo, null, 2)
  }
}