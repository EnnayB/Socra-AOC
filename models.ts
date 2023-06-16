export enum Material {
  ORE = "ORE",
  CLAY = "CLAY",
  OBSIDIAN = "OBSIDIAN",
  GEODE = "GEODE",
  DIAMOND = "DIAMOND",
}

export type MaterialCount = {
  [key in Material]: number
}

export class MaterialList {
  public items: MaterialCount
  constructor(initialMaterials? : MaterialCount) {
    this.items = initialMaterials ?? this.initItems()
  }

  private initItems(): MaterialCount {
    return {
      ORE: 0,
      CLAY: 0,
      OBSIDIAN: 0,
      GEODE: 0,
      DIAMOND: 0,
    }
  }

  public getMaterialQuantity(material: Material) {
    return this.items[material]
  }

  private validQuantity(quantity: number, remainingQuantity: number): boolean {
    return quantity >= 0 && remainingQuantity >= 0
  }

  public setMaterialQuantity(material: Material, quantity: number): void {
    this.items[material] = quantity
  }

  public addMaterial(material: Material, quantity: number): void {
    const newQuantity = this.items[material] + quantity
    if (!this.validQuantity(quantity, newQuantity)) {
      throw Error('Invalid quantity of material')
    }

    this.setMaterialQuantity(material, newQuantity)
  }

  public substractMaterial(material: Material, quantity: number): void {
    const newQuantity = this.items[material] - quantity
    if (!this.validQuantity(quantity, newQuantity)) {
      throw Error('Invalid quantity of material')
    }

    this.setMaterialQuantity(material, newQuantity)
  }
}

export class Robot {
  public miningMaterial: Material

  constructor(miningMaterial: Material) {
    this.miningMaterial = miningMaterial
  }
}

export class RobotCost extends Robot {
  public costs: MaterialList

  constructor(miningMaterial: Material, costs: MaterialList) {
    super(miningMaterial)
    this.costs = costs
  }
}

export class Inventory {
  private items: MaterialList
  constructor(initialItems?: MaterialList) {
    this.items = initialItems ?? new MaterialList()
  }

  public canAfford(robot: RobotCost): boolean {
    for (const [material, quantity] of Object.entries(robot.costs.items)) {
      if (this.items.getMaterialQuantity(material as Material) < quantity) {
        return false
      }
    }
    return true
  }

  public buyRobot(robot: RobotCost): Robot {
    if (!this.canAfford(robot)) {
      throw Error('Cannot buy robot, not enough materials')
    }

    for (const [material, quantity] of Object.entries(robot.costs.items)) {
      this.items.substractMaterial(material as Material, quantity)
    }

    return robot
  }

  public getMaterialQuantity(material: Material): number {
    return this.items.getMaterialQuantity(material)
  }

  public addMaterial(material: Material, quantity: number) {
    this.items.addMaterial(material, quantity)
  }

  public copy(): Inventory {
    return new Inventory(new MaterialList({ ...this.items.items }))
  }
}

export class Blueprint {
  public name: string
  public robotsCosts: { [key in Material]: RobotCost }

  constructor(name: string, robotsCosts?: { [key in Material]: RobotCost }) {
    this.name = name
    if (robotsCosts === undefined) {
      this.robotsCosts = {
        ORE: new RobotCost(Material.ORE, new MaterialList()),
        CLAY: new RobotCost(Material.CLAY, new MaterialList()),
        OBSIDIAN: new RobotCost(Material.OBSIDIAN, new MaterialList()),
        GEODE: new RobotCost(Material.GEODE, new MaterialList()),
        DIAMOND: new RobotCost(Material.GEODE, new MaterialList()),
      }
    }
    else {
      this.robotsCosts = robotsCosts
    }
  }

  public addRobotCost(robotCost: RobotCost) {
    this.robotsCosts[robotCost.miningMaterial] = robotCost
  }

  public getAffordableRobots(inventory: Inventory): RobotCost[] {
    const affordableRobots: RobotCost[] = []

    for (const robot of Object.values(this.robotsCosts)) {
      if (inventory.canAfford(robot)) {
        affordableRobots.push(robot)
      }
    }

    return affordableRobots.sort((firstRobot, secondRobot) => {
      const firstRobotValue = Object.values(Material).findIndex((val) => val === firstRobot.miningMaterial)
      const secondRobotValue = Object.values(Material).findIndex((val) => val === secondRobot.miningMaterial)

      return secondRobotValue - firstRobotValue
    })
  }

  public computeMaxMaterial(): { [key in Material]: number } {
    const maxMaterialsCount = {
      ORE: 0,
      CLAY: 0,
      OBSIDIAN: 0,
      GEODE: 0,
      DIAMOND: 0,
    }

    for (const robot of Object.values(this.robotsCosts)) {
      for (const material in Material) {
        if (robot.costs.getMaterialQuantity(material as Material) > maxMaterialsCount[material as Material]) {
          maxMaterialsCount[material as Material] = robot.costs.getMaterialQuantity(material as Material)
        }
      }
    }

    return maxMaterialsCount
  }
}