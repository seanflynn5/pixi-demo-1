import * as Matter from 'matter-js';
import { LabelScore } from "./LabelScore";
import { App } from '../system/App';
import { Background } from "./Background";
import { Scene } from '../system/Scene';
import { Hero } from "./Hero";
import { Platforms } from "./Platforms";
import { Leaderboard } from "./Leaderboard";
import Scores from "../system/Scores.json";

export class GameScene extends Scene {
    create() {
        this.createBackground();
        this.createHero();
        this.createPlatforms();
        this.setEvents();
        // Displays leaderboard
        this.showLeaderboard();
        //[13]
        this.createUI();
        //[/13]
    }
    //[13]
    createUI() {
        this.labelScore = new LabelScore();
        this.container.addChild(this.labelScore);
        this.hero.sprite.on("score", () => {
            this.labelScore.renderScore(this.hero.score);
        });
    }
    //[13]

    setEvents() {
        Matter.Events.on(App.physics, 'collisionStart', this.onCollisionStart.bind(this));
    }

    onCollisionStart(event) {
        const colliders = [event.pairs[0].bodyA, event.pairs[0].bodyB];
        const hero = colliders.find(body => body.gameHero);
        const platform = colliders.find(body => body.gamePlatform);

        if (hero && platform) {
            this.hero.stayOnPlatform(platform.gamePlatform);
        }

        const diamond = colliders.find(body => body.gameDiamond);

        if (hero && diamond) {
            this.hero.collectDiamond(diamond.gameDiamond);
        }
    }

    createHero() {
        this.hero = new Hero();
        this.container.addChild(this.hero.sprite);
        this.hero.assignName();
        console.log(this.hero.name)

        this.container.interactive = true;
        this.container.on("pointerdown", () => {
            this.hero.startJump();
        });
        // Sets condition to check for new high score upon death
        this.hero.sprite.once("die", () => {
            Scores[this.hero.name] = this.hero.score;
            const sortedScores = Object.entries(Scores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA); 
            if (this.hero.name === sortedScores[0][0]) {
                this.hero.startFireworksAnimation();
                this.hero.showNewHighScoreMessage();
            }
            this.hero.nameText.text = '';
            App.scenes.start("Game");
        });
        // [/14]
    }

    showLeaderboard() {
        this.leaderboard = new Leaderboard();
        this.container.addChild(this.leaderboard.container)
        this.leaderboard.show()
    }

    createBackground() {
        this.bg = new Background();
        this.container.addChild(this.bg.container);
    }

    createPlatforms() {
        this.platforms = new Platforms();
        this.container.addChild(this.platforms.container);
    }

    update(dt) {
        this.bg.update(dt);
        this.platforms.update(dt);
    }

    destroy() {
        Matter.Events.off(App.physics, 'collisionStart', this.onCollisionStart.bind(this));
        App.app.ticker.remove(this.update, this);
        this.bg.destroy();
        this.hero.destroy();
        this.platforms.destroy();
        this.labelScore.destroy();
    }
}