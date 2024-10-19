import Game from "../madjs/index.js";
import { Scene, BasicEntity3D } from "../madjs/index.js";

/**
 * @extends Scene
 */
class Chapter1 extends Scene {

      /**
       * @type {BasicEntity3D}
       */
      x;

      /**
       * 
       * @param {Game} game 
       */
      constructor( game ){
            super( game );

            this.createPerspectiveCamera( 'camera1', {
                  near: 1,
                  far: 2000,
                  fow: Math.PI*60/180,
            });
            
            this.x = new BasicEntity3D( game, {
                  indices: [ 
                        0, 1, 2, 
                        2, 1, 3,
                  ],
                  vertices: [
                        0, 0, 0,
                        1, 0, 0,
                        0, 1, 0,
                        1, 1, 0,
                  ],
            }, {
                  r: 0.7,
                  g: 0.5,
                  b: .9,
                  a: 1,
            });
            this.addEntity( this.x );
      }

      /**
       * 
       * @param {Game} game 
       */
      onEnter( game ){}

      /**
       * 
       * @param {Game} game 
       */
      onUpdate( game ){
            this.x.z -= 0.1;
      }
}

/**
 * @extends Scene
 */
class Chapter2 extends Scene {

      /**
       * @type {BasicEntity3D}
       */
      x;

      /**
       * 
       * @param {Game} game 
       */
      onEnter( game ){

            this.createPerspectiveCamera( 'camera1', {
                  near: 1,
                  far: 2000,
                  fow: Math.PI*60/180,
            });
            
            this.x = new BasicEntity3D( game, {
                  indices: [ 
                        0, 1, 2, 
                        2, 1, 3,
                  ],
                  vertices: [
                        0, 0, 0,
                        1, 0, 0,
                        0, 1, 0,
                        1, 1, 0,
                  ],
            }, {
                  r: 1,
                  g: 0.5,
                  b: .9,
                  a: 1,
            });
            this.addEntity( this.x );
      }

      /**
       * 
       * @param {Game} game 
       */
      onUpdate( game ){
            this.x.z -= 0.1;
      }
}



const game = new Game();


game.startGame();
game.changeScene( Chapter1 );

setTimeout( ()=>{
      game.changeScene( Chapter2 );
      setTimeout( ()=>{
            game.changeScene( Chapter1 );
      }, 1000 );
}, 1000 );


