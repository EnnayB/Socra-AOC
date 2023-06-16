import Queue from 'queue-fifo'

import Game from './game'
import { Blueprint, Material, RobotCost } from './models'

export default class Solver {
  private blueprints: Blueprint[]

  constructor(blueprints: Blueprint[]) {
    this.blueprints = blueprints
  }

  private computeBestScore(blueprint: Blueprint, game: Game): number {
    const gameQueue = new Queue<Game>()
    gameQueue.enqueue(game)

    const enqueueGame = (toEnqueue: Game, robot?: RobotCost): void => {
      const newGame = toEnqueue.copy()
      if (robot !== undefined) {
        newGame.buyRobot(robot)
      }
      else {
        newGame.nextTurn()
      }
      gameQueue.enqueue(newGame)
    }

    let currentBest = 0
    while (!gameQueue.isEmpty()) {
      game = gameQueue.dequeue() as Game

      if (game.isOver()) {
        const currentDiamondNumber = game.getDiamondNumber()
        currentBest = currentDiamondNumber > currentBest ? currentDiamondNumber : currentBest
      }
      else {
        const affordableRobots = blueprint.getAffordableRobots(game.inventory)
        let shouldWait = true

        for (const robot of affordableRobots) {
          if ([Material.DIAMOND, Material.GEODE].includes(robot.miningMaterial)) {
            enqueueGame(game, robot)
            shouldWait = false
          }

          if (game.isRobotValuable(robot)) {
            enqueueGame(game, robot)
            shouldWait = false
          }
        }

        if (shouldWait) {
          enqueueGame(game)
        }
      }
    }
    return currentBest
  }

  private maximizeBlueprint(blueprint: Blueprint): number {
    const game = new Game(blueprint.computeMaxMaterial())
    const res = this.computeBestScore(blueprint, game)
    console.log(`${blueprint.name} = ${res}`)
    return res
  }

  public solve(): number {
    const blueprintsScore = this.blueprints.map((blueprint) => this.maximizeBlueprint(blueprint))
    return Math.max(...blueprintsScore)
  }
}