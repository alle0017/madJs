import Game from "./madjs/index.js";
import { Scene, BasicEntity3D,TexturedEntity } from "./madjs/index.js";

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

            this.e = new TexturedEntity( game, {
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
                  texture: {
                        //@ts-ignore
                        img: import.meta.resolve('./cat.jpg'),
                        width: 1000,
                        height: 1000,
                        format: 'rgba8unorm',
                        dimension: '2d',
                  },
                  sampler: {
                        addressMode: {}
                  },
                  textureCoordinates: [
                        0,0,
                        1,0,
                        0,1,
                        1,1,
                  ]
            });

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



