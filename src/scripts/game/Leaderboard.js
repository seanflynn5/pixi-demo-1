import * as PIXI from 'pixi.js';
import { App } from "../system/App";
import Scores from "../system/Scores.json"; // Import the JSON data

export class Leaderboard {
    constructor() {
        this.container = new PIXI.Container();
        this.modalVisible = false;
        this.leaderboardData = [];

        // Create a semi-transparent background
        const background = new PIXI.Graphics();
        background.beginFill(0x000000, 0.7);
        background.drawRect(0, 0, window.innerWidth, window.innerHeight);
        background.endFill();

        // Create modal content
        const modalText = new PIXI.Text('Leaderboard', {
            fontSize: 24,
            fill: 0xFFFFFF,
        });
        modalText.anchor.set(0.5);
        modalText.position.set(window.innerWidth / 2, 50);

        // Add background and content to the modal container
        this.container.addChild(background, modalText);

        // Create and display leaderboard entries using Scores data
        this.createLeaderboardEntries();

        this.container.visible = true;

        // Add the modal container to the stage (if available)
        if (App.stage) {
            App.stage.addChild(this.container);
        }
    }

    // Create leaderboard entries using scores from the JSON object
    createLeaderboardEntries() {
        const entryCount = 10; 
        const entryHeight = 30;
        const startY = 100; 

        // Iterate through the Scores data and use it to create entries
        const sortedScores = Object.entries(Scores)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA); // Sort by score in descending order

        for (let i = 0; i < entryCount && i < sortedScores.length; i++) {
            const [name, score] = sortedScores[i];

            const entryText = new PIXI.Text(`${name}: ${score}`, {
                fontSize: 18,
                fill: 0xFFFFFF,
            });
            entryText.anchor.set(0, 0.5);
            entryText.position.set(20, startY + i * entryHeight);

            // Store the leaderboard data
            this.leaderboardData.push({ name, score });

            // Add the entry text to the container
            this.container.addChild(entryText);
        }
    }

    // Show the modal
    show() {
        this.container.visible = true;
        this.modalVisible = true;
    }

    // Hide the modal
    hide() {
        this.container.visible = false;
        this.modalVisible = false;
    }
}