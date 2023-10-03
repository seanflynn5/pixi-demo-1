import * as Matter from 'matter-js';
import * as PIXI from "pixi.js";
import gsap from 'gsap';
import { App } from '../system/App';
import Scores from "../system/Scores.json";

export class Hero {
    constructor() {
        this.createSprite();
        this.createBody();
        App.app.ticker.add(this.update, this);

        this.dy = App.config.hero.jumpSpeed;
        this.maxJumps = App.config.hero.maxJumps;
        this.jumpIndex = 0;
        this.score = 0;
        this.nameText = new PIXI.Text('', {
            fontFamily: "Verdana",
            fontSize: 20, // Adjust the font size as needed
            fill: "#FF6229", // Adjust the text color as needed
        });
        this.nameText.position.set(App.app.renderer.width - 10, 10);
        this.nameText.anchor.set(1, 0); // Align to top-right
        App.app.stage.addChild(this.nameText);
    }

    assignName() {
        const keys = Object.keys(Scores);
        const randomIndex = Math.floor(Math.random() * keys.length);
        this.name = keys[randomIndex];

    }

    collectDiamond(diamond) {
        if (diamond.isDistinct) {
            this.score = this.score + 9;
            this.sprite.emit("score");
            diamond.destroy();
        }
        ++this.score;
        this.sprite.emit("score");
        diamond.destroy();
    }
    //[/12]

    startJump() {
        if (this.platform || this.jumpIndex === 1) {
            ++this.jumpIndex;
            this.platform = null;
            Matter.Body.setVelocity(this.body, { x: 0, y: -this.dy });
        }
    }

    // [08]
    stayOnPlatform(platform) {
        this.platform = platform;
        this.jumpIndex = 0;
    }
    // [/08]

    createBody() {
        this.body = Matter.Bodies.rectangle(this.sprite.x + this.sprite.width / 2, this.sprite.y + this.sprite.height / 2, this.sprite.width, this.sprite.height, {friction: 0});
        Matter.World.add(App.physics.world, this.body);
        this.body.gameHero = this;
    }

    update() {
        this.sprite.x = this.body.position.x - this.sprite.width / 2;
        this.sprite.y = this.body.position.y - this.sprite.height / 2;

        this.nameText.text = `Current Player: ${this.name}`;

        // [14]
        if (this.sprite.y > window.innerHeight || (this.sprite.x + this.sprite.width < 0)) {
            this.sprite.emit("die");
        }
        // [/14]
    }

    createSprite() {
        this.sprite = new PIXI.AnimatedSprite([
            App.res("walk1"),
            App.res("walk2")
        ]);

        this.sprite.x = App.config.hero.position.x;
        this.sprite.y = App.config.hero.position.y;
        this.sprite.loop = true;
        this.sprite.animationSpeed = 0.1;
        this.sprite.width = this.sprite.width - 25; // Reduced width of hero because he could be stuck in gaps between Platforms
        this.sprite.play();
    }

    // Function that runs animation upon there being a new top scorer on the leaderboard 
    startFireworksAnimation() {
        const fireworks = [];
    
        for (let i = 0; i < 600; i++) {
            const firework = new PIXI.Graphics();
            const randomColor = getRandomColor(); 
            firework.beginFill(randomColor);
            firework.drawCircle(8, 8, 12);
            firework.endFill();
            firework.x = Math.random() * App.app.renderer.width;
            firework.y = App.app.renderer.height + 100
            App.app.stage.addChild(firework);
            fireworks.push({ firework, color: randomColor });
        }
    
        const explosionDuration = 2000;
        const explosionHeight = 100; 
    
        fireworks.forEach(({ firework, color }) => {
            const targetY = firework.y - Math.random() * explosionHeight;
            const targetScale = Math.random() * 2 + 1;
    
            // Animate the fireworks
            const animateFirework = () => {
                const now = Date.now();
                const startTime = now;
                const endTime = now + explosionDuration;
    
                const updateFirework = () => {
                    const currentTime = Date.now();
                    const progress = (currentTime - startTime) / explosionDuration;
    
                    if (progress < 1) {
                        firework.alpha = 1 - progress;
                        firework.y = firework.y - (explosionHeight * progress);
                        firework.scale.set(targetScale * progress);
                        requestAnimationFrame(updateFirework);
                    } else {
                        App.app.stage.removeChild(firework);
                    }
                };
    
                requestAnimationFrame(updateFirework);
            };
    
            setTimeout(animateFirework, Math.random() * explosionDuration);
        });
    
        // Function to get a random color
        function getRandomColor() {
            const colors = [0xFFA500, 0x008000, 0xFFFFFF]; 
            const randomIndex = Math.floor(Math.random() * colors.length);
            return colors[randomIndex];
        }
    }
    
    showNewHighScoreMessage() {
        const messageText = new PIXI.Text('New High Score!', {
            fontFamily: "Verdana",
            fontWeight: "bold",
            fontSize: 44,
            fill: ["#FF7F50"],
            align: 'center',
            dropShadow: true, 
            dropShadowColor: "#FFFFFF", 
            dropShadowBlur: 10, 
            dropShadowDistance: 0, 
        });

        // Position the message text at the center of the window
        messageText.x = (App.app.renderer.width - messageText.width) / 2;
        messageText.y = (App.app.renderer.height - messageText.height) / 2;

        // Set initial alpha to 0
        messageText.alpha = 0;

        App.app.stage.addChild(messageText);

        // Use GSAP for the fade-in and fade-out animation
        const fadeDuration = 4; // Duration in seconds
        const fadeInTime = fadeDuration * 0.5;
        const fadeOutTime = fadeDuration * 0.5;

        gsap.to(messageText, {
            alpha: 1,
            duration: fadeInTime,
            onComplete: () => {
                // Fade-out animation
                gsap.to(messageText, {
                    alpha: 0,
                    duration: fadeOutTime,
                    onComplete: () => {
                        App.app.stage.removeChild(messageText);
                    },
                });
            },
        });
    }


    destroy() {
        App.app.ticker.remove(this.update, this);
        Matter.World.add(App.physics.world, this.body);
        this.sprite.destroy();
    }
}