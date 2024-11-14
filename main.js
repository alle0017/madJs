import Game from "./madjs/index.js";
import { Scene, SpriteEntity, } from "./madjs/index.js";

/**
 * @extends Scene
 */
class Chapter1 extends Scene {

      /**
       * @type {number}
       */
      x;
      /**
       * @type {number}
       */
      z;

      /**
       * 
       * @param {Game} game 
       */
      constructor( game ){
            super( game );

            this.createPerspectiveCamera( 'camera1', {
                  near: 0.5,
                  far: 2000,
                  fow: Math.PI*60/180,
            });
            
            this.x = 0;
            this.z = 0;

            //@ts-ignore
            this.e = new SpriteEntity( game, import.meta.resolve('./cat.jpg'), 1000, 1000 );

            window.addEventListener( 'keydown', e =>{
                  this.addEntity( this.e );
                  if( e.key == 'ArrowUp' ){
                        this.z -= 0.05;
                        this.moveCamera( 'camera1', {
                              pitch: this.z,
                        })
                  }else if( e.key == 'ArrowLeft' ){
                        this.e.z += 0.5;
                  }else if( e.key == 'ArrowRight' ){
                        this.e.z -= 0.5;
                        console.log( this.e )
                  }
            })
      }

      /**
       * 
       * @param {Game} game 
       */
      onEnter( game ){}
}


const game = new Game();


game.changeScene( Chapter1 );
game.startGame();



